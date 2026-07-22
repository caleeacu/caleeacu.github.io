#!/usr/bin/env python3
"""
build_static.py — Google Sheets 내용을 정적 HTML로 굽는 빌드 스크립트.

동작:
  1. FAQ 시트를 읽어 faq.html의 마커 사이에 정적 Q&A + 사이드바 + FAQPage 스키마를 삽입
  2. Research Map 시트(메인 탭 + Excluded 탭)를 읽어 learning-center.html에 JSON으로 내장
  3. 모든 HTML 페이지의 canonical / OG / 트위터 카드 태그를 점검하고 없거나
     틀리면 자동 복구 (페이지를 재구성하다 태그가 빠져도 다음 빌드에서 되살아남)

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


# ── SEO 메타 태그 자동 복구 ────────────────────────────────────────
# 페이지를 재구성하거나 구버전으로 덮어써서 canonical/OG가 사라져도
# 다음 빌드에서 자동으로 되살린다. 태그가 이미 올바르면 건드리지 않는다.

DOMAIN = "https://research.caleeacu.com"
OG_IMAGE = f"{DOMAIN}/assets/images/og-image.jpg"

# 루트 페이지: 파일명 -> canonical 경로 (cases/*.html은 자동 처리)
ROOT_PAGES = {
    "index.html": "/",
    "about.html": "/about.html",
    "blog.html": "/blog.html",
    "faq.html": "/faq.html",
    "learning-center.html": "/learning-center.html",
}

def _attr(s):
    """HTML 속성값으로 안전하게."""
    return (str(s or "").replace("&", "&amp;").replace('"', "&quot;")
            .replace("<", "&lt;").replace(">", "&gt;"))

def _unescape_once(s):
    """title/description에서 뽑은 값이 이미 이스케이프돼 있으면 중복 방지."""
    return (s.replace("&amp;", "&").replace("&quot;", '"')
             .replace("&lt;", "<").replace("&gt;", ">"))

def seo_block(url, title, desc):
    t, d = _attr(_unescape_once(title)), _attr(_unescape_once(desc))
    return (f'<link rel="canonical" href="{url}"/>\n'
            f'<meta property="og:type" content="website"/>\n'
            f'<meta property="og:url" content="{url}"/>\n'
            f'<meta property="og:title" content="{t}"/>\n'
            f'<meta property="og:description" content="{d}"/>\n'
            f'<meta property="og:image" content="{OG_IMAGE}"/>\n'
            f'<meta property="og:image:width" content="1200"/>\n'
            f'<meta property="og:image:height" content="630"/>\n'
            f'<meta name="twitter:card" content="summary_large_image"/>\n'
            f'<meta name="twitter:title" content="{t}"/>\n'
            f'<meta name="twitter:description" content="{d}"/>\n'
            f'<meta name="twitter:image" content="{OG_IMAGE}"/>')

def fix_seo(path, url):
    """canonical/OG/트위터 태그를 점검하고 필요 시 복구. 변경됐으면 True."""
    html = path.read_text(encoding="utf-8")

    # 이미 올바른 canonical + 필수 OG가 전부 있으면 통과
    has_canon = re.search(r'<link rel="canonical" href="' + re.escape(url) + r'"\s*/?>', html)
    needed = ['og:type', 'og:url', 'og:title', 'og:description', 'og:image',
              'twitter:card', 'twitter:title', 'twitter:image']
    if has_canon and all(f'"{n}"' in html for n in needed):
        return False

    m = re.search(r"<title>(.*?)</title>", html, re.S)
    title = m.group(1).strip() if m else "CALee Research"
    m = re.search(r'<meta name="description"\s+content="([^"]*)"', html)
    desc = m.group(1).strip() if m else ""

    # 기존(불완전한) 태그 제거
    cleaned = re.sub(r'\s*<link rel="canonical"[^>]*>', "", html)
    cleaned = re.sub(r'\s*<meta property="og:[^"]*"[^>]*>', "", cleaned)
    cleaned = re.sub(r'\s*<meta name="twitter:[^"]*"[^>]*>', "", cleaned)

    blk = seo_block(url, title, desc)
    m = re.search(r'<meta name="description"[^>]*>', cleaned)
    if m:
        cleaned = cleaned[:m.end()] + "\n" + blk + cleaned[m.end():]
    elif "</title>" in cleaned:
        cleaned = cleaned.replace("</title>", "</title>\n" + blk, 1)
    else:
        return False  # head를 못 찾으면 안전하게 포기

    path.write_text(cleaned, encoding="utf-8")
    return True

def run_seo_pass():
    """루트 페이지 + cases/*.html 전체 점검."""
    fixed = []
    for name, route in ROOT_PAGES.items():
        p = ROOT / name
        if p.exists() and fix_seo(p, DOMAIN + route):
            fixed.append(name)
    cases_dir = ROOT / "cases"
    if cases_dir.is_dir():
        for p in sorted(cases_dir.glob("*.html")):
            route = "/cases/" if p.name == "index.html" else f"/cases/{p.name}"
            if fix_seo(p, DOMAIN + route):
                fixed.append(f"cases/{p.name}")
    if fixed:
        print(f"[SEO] 메타 태그 복구 {len(fixed)}건: {', '.join(fixed[:8])}"
              + (" 외" if len(fixed) > 8 else ""))
    else:
        print("[SEO] 전 페이지 메타 태그 정상 — 변경 없음")
    return fixed

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

    # SEO 메타 태그 점검·복구 (시트 로드 실패와 무관하게 항상 실행)
    changed += run_seo_pass()

    print("변경된 파일:", ", ".join(changed) if changed else "없음")

if __name__ == "__main__":
    main()
