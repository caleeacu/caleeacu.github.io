/* site.js — research.caleeacu.com */
(function(){
  var LOGO = '/assets/images/logo.svg';

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
      +'</div>'
      +'<div class="footer-col">'
      +'<h4>Research</h4>'
      +'<a href="/learning-center.html">Learning Center</a><br>'
      +'<a href="/blog.html">Blog — Grandpa\'s Tale</a><br>'
      +'<a href="/faq.html">FAQ</a><br>'
      +'<a href="https://ssrn.com/abstract=6405558" target="_blank" rel="noopener">SSRN Working Paper</a><br>'
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
