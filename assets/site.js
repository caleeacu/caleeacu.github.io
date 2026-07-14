/* site.js — research.caleeacu.com */
(function(){
  var LOGO = '/assets/images/logo-white.png';

  var PAGES = [
    {label:'Home',           href:'/'},
    {label:'About',          href:'/about.html'},
    {label:'Blog',           href:'/blog.html'},
    {label:'Learning Center',href:'/learning-center.html'},
    {label:'FAQ',            href:'/faq.html'},
  ];

  function buildNav(){
    var path = window.location.pathname;
    var links = PAGES.map(function(p){
      var active = (path===p.href||(p.href!=='/'&&path.indexOf(p.href.replace('.html',''))===0))?' class="active"':'';
      return '<a href="'+p.href+'"'+active+'>'+p.label+'</a>';
    }).join('');
    var html = '<header class="site-header">'
      +'<div class="container">'
      +'<a href="/" class="logo"><img src="'+LOGO+'" alt="CALee Research" height="42"/></a>'
      +'<button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">☰</button>'
      +'<nav class="site-nav">'+links
      +'<a href="https://caleeacu.com" class="nav-clinic" target="_blank" rel="noopener">← Clinic</a>'
      +'</nav>'
      +'</div>'
      +'</header>';
    document.body.insertAdjacentHTML('afterbegin', html);
    var btn=document.querySelector('.nav-toggle'), nav=document.querySelector('.site-nav');
    btn.addEventListener('click',function(){
      var open=nav.classList.toggle('open');
      btn.setAttribute('aria-expanded',open);
      btn.textContent=open?'✕':'☰';
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){ nav.classList.remove('open'); btn.textContent='☰'; });
    });
  }

  function buildFooter(){
    var html = '<footer class="site-footer">'
      +'<div class="container">'
      +'<div class="footer-inner">'
      +'<div class="footer-col">'
      +'<h4>CALee Research</h4>'
      +'<p>Korean medicine framework, evidence map,<br>clinical education, and published research.</p>'
      +'<p style="margin-top:8px;"><a href="https://caleeacu.com" target="_blank" rel="noopener" style="color:#8DBFA0;">→ CALee Acupuncture Clinic</a></p>'
      +'<div class="footer-social">'
      +'<a href="https://www.facebook.com/620704767792748" target="_blank" rel="noopener" aria-label="Facebook">'
      +'<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.2h2.8V21h3.4z"/></svg></a>'
      +'<a href="https://www.instagram.com/caleeacu.com_" target="_blank" rel="noopener" aria-label="Instagram">'
      +'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg></a>'
      +'<a href="https://www.linkedin.com/in/calee-acupuncture" target="_blank" rel="noopener" aria-label="LinkedIn">'
      +'<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M6.9 8.6H3.6V21h3.3V8.6zM5.2 3.2a1.9 1.9 0 100 3.9 1.9 1.9 0 000-3.9zM20.4 21h-3.3v-6.1c0-1.5-.5-2.5-1.9-2.5-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9V21H9.9V8.6h3.3v1.4c.4-.7 1.2-1.7 3-1.7 2.2 0 4.2 1.4 4.2 4.6V21z"/></svg></a>'
      +'</div>'
      +'</div>'
      +'<div class="footer-col">'
      +'<h4>Research</h4>'
      +'<a href="/learning-center.html">Learning Center</a><br>'
      +'<a href="/blog.html">Blog — Grandpa\'s Tale</a><br>'
      +'<a href="/faq.html">FAQ</a><br>'
      +'<a href="https://ssrn.com/abstract=6405558" target="_blank" rel="noopener">SSRN — Diagnostic Framework (2026)</a><br>'
      +'<a href="https://ssrn.com/abstract=7076719" target="_blank" rel="noopener">SSRN — Neijing Epistemology (2026)</a><br>'
      +'<a href="https://scholar.google.com/citations?user=wW5jSL4AAAAJ" target="_blank" rel="noopener">Google Scholar</a>'
      +'</div>'
      +'<div class="footer-col">'
      +'<h4>Publications</h4>'
      +'<a href="https://www.amazon.com/dp/B0GSXDDLGK" target="_blank" rel="noopener">Korean Medicine: Theoretical Foundations</a><br>'
      +'<a href="https://www.amazon.com/dp/B0GX374FK9" target="_blank" rel="noopener">Classical Medicine and Modern Disease</a><br>'
      +'<p style="margin-top:10px;"><a href="mailto:caleeacu@gmail.com">caleeacu@gmail.com</a></p>'
      +'</div>'
      +'</div>'
      +'<div class="footer-bottom">'
      +'<span>© '+new Date().getFullYear()+' CALee Acupuncture — Hoon Lee, L.Ac., DAOM(c)</span>'
      +'<span><a href="https://caleeacu.com" style="color:rgba(255,255,255,.3);">caleeacu.com</a></span>'
      +'</div>'
      +'</div>'
      +'</footer>';
    document.body.insertAdjacentHTML('beforeend', html);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){ buildNav(); buildFooter(); });
  } else { buildNav(); buildFooter(); }
})();
