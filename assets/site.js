/* site.js — shared nav + footer injection */
(function(){
  var LOGO = 'https://img1.wsimg.com/isteam/ip/939e6851-368e-49ee-b58e-05dc513bc5de/noBgWhite.png/:/rs=h:104,cg:true,m/qt=q:95';
  var BOOK = 'https://book.squareup.com/appointments/8aacqfmuj3vxuw/location/LHJ9XRWJX75B1/services';

  var PAGES = [
    {label:'Home',      href:'/'},
    {label:'About',     href:'/about.html'},
    {label:'Services',  href:'/services.html'},
    {label:'Blog',      href:'/blog.html'},
    {label:'Learning Center', href:'/learning-center.html'},
    {label:'FAQ',       href:'/faq.html'},
    {label:'Contact',   href:'/contact.html'},
  ];

  /* ── NAV ── */
  function buildNav(){
    var path = window.location.pathname;
    var links = PAGES.map(function(p){
      var active = (path===p.href||(p.href!=='/'&&path.indexOf(p.href.replace('.html',''))===0))?' active':'';
      return '<a href="'+p.href+'"'+active+'>'+p.label+'</a>';
    }).join('');
    var html = '<header class="site-header">'
      +'<div class="container">'
      +'<a href="/" class="logo"><img src="'+LOGO+'" alt="CALee Acupuncture" height="42"/></a>'
      +'<button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">☰</button>'
      +'<nav class="site-nav">'+links
      +'<a href="'+BOOK+'" class="nav-book" target="_blank" rel="noopener">Book</a>'
      +'</nav>'
      +'</div>'
      +'</header>';
    document.body.insertAdjacentHTML('afterbegin', html);

    /* mobile toggle */
    var btn = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');
    btn.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? '✕' : '☰';
    });
    /* close on link click */
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){ nav.classList.remove('open'); btn.textContent='☰'; });
    });
  }

  /* ── FOOTER ── */
  function buildFooter(){
    var html = '<footer class="site-footer">'
      +'<div class="container">'
      +'<div class="footer-inner">'
      +'<div class="footer-col">'
      +'<h4>CALee Acupuncture</h4>'
      +'<p>Korean acupuncture rooted in constitutional diagnosis.<br>Buena Park, CA</p>'
      +'<div class="social-links">'
      +'<a href="https://www.facebook.com/620704767792748" target="_blank" rel="noopener">Facebook</a>'
      +'<a href="https://www.instagram.com/caleeacu.com_" target="_blank" rel="noopener">Instagram</a>'
      +'<a href="https://www.linkedin.com/in/calee-acupuncture" target="_blank" rel="noopener">LinkedIn</a>'
      +'</div>'
      +'</div>'
      +'<div class="footer-col">'
      +'<h4>Pages</h4>'
      +PAGES.map(function(p){ return '<a href="'+p.href+'">'+p.label+'</a><br>'; }).join('')
      +'</div>'
      +'<div class="footer-col">'
      +'<h4>Contact</h4>'
      +'<p>6881 Stanton Ave Ste F (A+ Entrance)<br>Buena Park, CA 90621</p>'
      +'<p style="margin-top:8px"><a href="sms:+15629078640">(562) 907-8640</a> · Text only<br>'
      +'<a href="https://wa.me/15629078640" target="_blank" rel="noopener">WhatsApp</a><br>'
      +'<a href="mailto:caleeacu@gmail.com">caleeacu@gmail.com</a></p>'
      +'</div>'
      +'</div>'
      +'<div class="footer-bottom">'
      +'<span>© '+new Date().getFullYear()+' CALee Acupuncture — All Rights Reserved</span>'
      +'<span>Hoon Lee, L.Ac., DAOM(c)</span>'
      +'</div>'
      +'</div>'
      +'</footer>';
    document.body.insertAdjacentHTML('beforeend', html);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){ buildNav(); buildFooter(); });
  } else {
    buildNav(); buildFooter();
  }
})();
