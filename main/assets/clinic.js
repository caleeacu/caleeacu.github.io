/* clinic.js — caleeacu.com · shared nav + footer (GitHub Pages ready) */
(function(){
  var PAGES = [
    {label:'Home',     href:'/'},
    {label:'About',    href:'/about.html'},
    {label:'Services', href:'/services.html'},
    {label:'Contact',  href:'/contact.html'}
  ];
  var RESEARCH_URL = 'https://research.caleeacu.com';

  function buildHeader(){
    var path = window.location.pathname;
    var links = PAGES.map(function(p){
      var isActive = (path === p.href) ||
        (p.href === '/' && (path === '/index.html' || path === '')) ||
        (p.href !== '/' && path.indexOf(p.href.replace('.html','')) === 0);
      return '<a href="' + p.href + '"' + (isActive ? ' class="active"' : '') + '>' + p.label + '</a>';
    }).join('');

    var html =
      '<header class="site-header">' +
        '<div class="container nav-wrapper">' +
          '<a class="brand" href="/" aria-label="CALee Acupuncture home">' +
            '<img src="/assets/images/logo.png" alt="CALee Acupuncture logo"/>' +
          '</a>' +
          '<button class="nav-toggle" aria-label="Open menu" aria-expanded="false">&#9776;</button>' +
          '<nav class="site-nav" aria-label="Main">' +
            links +
            '<a class="nav-research" href="' + RESEARCH_URL + '" target="_blank" rel="noopener">Research Center &#8599;</a>' +
          '</nav>' +
        '</div>' +
      '</header>';

    document.body.insertAdjacentHTML('afterbegin', html);

    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function buildFooter(){
    var year = new Date().getFullYear();
    var html =
      '<footer class="site-footer">' +
        '<div class="container">' +
          '<div class="footer-grid">' +
            '<div>' +
              '<p class="footer-brand">CALee Acupuncture</p>' +
              '<p>Korean acupuncture &amp; constitutional medicine.<br/>Experience natural healing in Buena Park, CA.</p>' +
            '</div>' +
            '<div>' +
              '<h4>Visit</h4>' +
              '<p>6881 Stanton Ave, Ste F<br/>Buena Park, CA 90621</p>' +
              '<a href="tel:+17140000000">(714) XXX-XXXX</a>' +
              '<a href="mailto:info@caleeacu.com">info@caleeacu.com</a>' +
            '</div>' +
            '<div>' +
              '<h4>Explore</h4>' +
              '<a href="/about.html">About the Practice</a>' +
              '<a href="/services.html">Clinical Services</a>' +
              '<a href="/contact.html">Book an Appointment</a>' +
              '<a href="' + RESEARCH_URL + '" target="_blank" rel="noopener">Research Center &#8599;</a>' +
            '</div>' +
          '</div>' +
          '<div class="footer-bottom">&copy; ' + year + ' CALee Acupuncture. All rights reserved.</div>' +
        '</div>' +
      '</footer>';
    document.body.insertAdjacentHTML('beforeend', html);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ buildHeader(); buildFooter(); });
  } else {
    buildHeader(); buildFooter();
  }
})();
