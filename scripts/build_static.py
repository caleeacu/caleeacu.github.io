#!/usr/bin/env python3
"""
build_static.py — Google Sheets 내용을 정적 HTML로 굽는 빌드 스크립트.

동작:
  1. FAQ 시트를 읽어 faq.html의 마커 사이에 정적 Q&A + 사이드바 + FAQPage 스키마를 삽입
  2. Research Map 시트(메인 탭 + Excluded 탭)를 읽어 learning-center.html에 JSON으로 내장

시트는 계속 Google Sheets에서 관리하면 됩니다. 이 스크립트는 GitHub Actions가
매일 자동 실행하며, 내용이 바뀐 경우에만 커밋합니다.

로컬 테스트: python3 scripts/build_static.py --faq-csv test.csv (파일로 대체 가능)
"""
import csv
import io
import json
import re
import sys
import urllib.request
from pathlib import Path

SHEET_ID = "1e7pPwW9FC3aTICG1GYJagYQfTALOtIzhAa0SWIga7kA"
ROOT = Path(__file__).resolve().parent.parent  # 저장소 루트

# ── 유틸 ──────────────────────────────────────────────────────────

def esc(s):
    return (str(s or "").replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;").replace("'", "&#39;"))

def csv_url(gid=None, sheet=None):
    base = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv"
    if gid is not None:
        return f"{base}&gid={gid}"
    return f"{base}&sheet={urllib.request.quote(sheet)}"

def fetch_rows(url_or_path):
    """CSV를 읽어 dict 행 리스트로 반환. URL 또는 로컬 파일 경로 지원."""
    if url_or_path.startswith("http"):
        req = urllib.request.Request(url_or_path, headers={"User-Agent": "caleeacu-build/1.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            text = r.read().decode("utf-8")
    else:
        text = Path(url_or_path).read_text(encoding="utf-8")
    rows = list(csv.DictReader(io.StringIO(text)))
    # 헤더 공백 정리
    out = []
    for row in rows:
        clean = {}
        for k, v in row.items():
            if k is None:
                continue
            clean[k.strip()] = (v or "").strip()
        out.append(clean)
    return out

def pick(row, keys):
    """대소문자 무시 헤더 매칭 (페이지 JS의 pick()과 동일 동작)."""
    lower = {k.lower(): v for k, v in row.items()}
    for k in keys:
        if k.lower() in lower:
            return lower[k.lower()]
    return ""

def inject(html, marker, content):
    """<!-- BUILD:{marker}:START --> ... END 사이를 교체."""
    start = f"<!-- BUILD:{marker}:START -->"
    end = f"<!-- BUILD:{marker}:END -->"
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.S)
    if not pattern.search(html):
        raise RuntimeError(f"마커 없음: {marker}")
    return pattern.sub(start + "\n" + content + "\n" + end, html)

# ── FAQ 빌드 ──────────────────────────────────────────────────────

def build_faq(rows):
    cat_order, cat_map, cat_labels = [], {}, {}
    schema_items = []
    for row in rows:
        cid = pick(row, ["CategoryID", "Category ID"])
        label = pick(row, ["Category"])
        q = pick(row, ["Question"])
        a = pick(row, ["Answer"])
        if not (cid and q and a):
            continue
        if cid not in cat_map:
            cat_map[cid] = []
            cat_order.append(cid)
            cat_labels[cid] = label or cid
        cat_map[cid].append((q, a))
        schema_items.append({"@type": "Question", "name": q,
                             "acceptedAnswer": {"@type": "Answer", "text": a}})

    # 사이드바
    nav = "".join(
        f'<a href="#cat-{esc(cid)}" data-cat="{esc(cid)}">{esc(cat_labels[cid])}</a>'
        for cid in cat_order)

    # 본문 블록 (페이지 JS의 makeItem/render와 동일 마크업 — 검색·아코디언 호환)
    blocks = []
    for cid in cat_order:
        items = cat_map[cid]
        parts = [f'<div class="cat-block" id="cat-{esc(cid)}">'
                 f'<div class="cat-header"><h2>{esc(cat_labels[cid])}</h2>'
                 f'<span class="cat-count">{len(items)} questions</span></div>']
        for q, a in items:
            dq = esc((q + " " + a).lower())
            parts.append(
                f'<div class="faq-item" data-q="{dq}">'
                f'<button class="faq-q" aria-expanded="false"><span>{esc(q)}</span>'
                f'<span class="faq-icon">+</span></button>'
                f'<div class="faq-a"><div class="faq-a-inner">{esc(a)}</div></div></div>')
        parts.append("</div>")
        blocks.append("".join(parts))

    schema = ('<script type="application/ld+json">'
              + json.dumps({"@context": "https://schema.org", "@type": "FAQPage",
                            "mainEntity": schema_items}, ensure_ascii=False)
              + "</script>")
    total = sum(len(v) for v in cat_map.values())
    return nav, "\n".join(blocks), schema, total

# ── Learning Center (Research Map) 빌드 ───────────────────────────

def build_rm(main_rows, excl_rows):
    payload = json.dumps({"main": main_rows, "excluded": excl_rows},
                         ensure_ascii=False, separators=(",", ":"))
    # </script> 조기 종료 방지
    payload = payload.replace("</", "<\\/")
    return f'<script id="rm-static-data" type="application/json">{payload}</script>'

# ── 메인 ──────────────────────────────────────────────────────────

def main():
    args = dict(zip(sys.argv[1::2], sys.argv[2::2]))
    faq_src = args.get("--faq-csv") or csv_url(sheet="FAQ")
    main_src = args.get("--main-csv") or csv_url(gid="0")
    excl_src = args.get("--excl-csv") or csv_url(sheet="Excluded")

    changed = []

    # FAQ
    try:
        faq_rows = fetch_rows(faq_src)
    except Exception as e:
        print(f"[FAQ] 시트 로드 실패 — 건너뜀: {e}")
        faq_rows = None
    if faq_rows:
        nav, items, schema, total = build_faq(faq_rows)
        path = ROOT / "faq.html"
        html = path.read_text(encoding="utf-8")
        new = inject(html, "FAQ-NAV", nav)
        new = inject(new, "FAQ-ITEMS", items)
        new = inject(new, "FAQ-SCHEMA", schema)
        if new != html:
            path.write_text(new, encoding="utf-8")
            changed.append("faq.html")
        print(f"[FAQ] {total}개 질문 정적 렌더링 완료")

    # Research Map
    try:
        main_rows = fetch_rows(main_src)
        try:
            excl_rows = fetch_rows(excl_src)
        except Exception:
            excl_rows = []
    except Exception as e:
        print(f"[RM] 시트 로드 실패 — 건너뜀: {e}")
        main_rows = None
    if main_rows:
        blob = build_rm(main_rows, excl_rows)
        path = ROOT / "learning-center.html"
        html = path.read_text(encoding="utf-8")
        new = inject(html, "RM-DATA", blob)
        if new != html:
            path.write_text(new, encoding="utf-8")
            changed.append("learning-center.html")
        print(f"[RM] 논문 {len(main_rows)}건 + 제외 {len(excl_rows)}건 내장 완료")

    print("변경된 파일:", ", ".join(changed) if changed else "없음")

if __name__ == "__main__":
    main()
