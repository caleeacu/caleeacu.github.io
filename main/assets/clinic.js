/* clinic.js — caleeacu.com · shared nav + footer (works locally & on GitHub Pages) */
(function(){
  var PAGES = [
    {label:'Home',     href:'index.html',    key:'index'},
    {label:'About',    href:'about.html',    key:'about'},
    {label:'Services', href:'services.html', key:'services'},
    {label:'Contact',  href:'contact.html',  key:'contact'}
  ];
  var RESEARCH_URL = 'https://research.caleeacu.com';
  var BOOKING_URL = 'https://book.squareup.com/appointments/8aacqfmuj3vxuw/location/LHJ9XRWJX75B1/services';

  function currentKey(){
    var file = window.location.pathname.split('/').pop();
    if (!file || file === '' ) return 'index';
    return file.replace('.html','');
  }

  function buildHeader(){
    var cur = currentKey();
    var links = PAGES.map(function(p){
      return '<a href="' + p.href + '"' + (cur === p.key ? ' class="active"' : '') + '>' + p.label + '</a>';
    }).join('');

    var html =
      '<header class="site-header">' +
        '<div class="container nav-wrapper">' +
          '<a class="brand" href="index.html" aria-label="CALee Acupuncture home">' +
            '<img src="assets/images/logo.png" alt="CALee Acupuncture logo"/>' +
          '</a>' +
          '<button class="nav-toggle" aria-label="Open menu" aria-expanded="false">&#9776;</button>' +
          '<nav class="site-nav" aria-label="Main">' +
            links +
            '<a class="nav-research nav-book" href="' + BOOKING_URL + '" target="_blank" rel="noopener">Book Now</a>' +
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
              '<div class="footer-social">' +
                '<a href="https://www.facebook.com/620704767792748" target="_blank" rel="noopener" aria-label="Facebook">' +
                  '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.2h2.8V21h3.4z"/></svg>' +
                '</a>' +
                '<a href="https://www.instagram.com/caleeacu.com_" target="_blank" rel="noopener" aria-label="Instagram">' +
                  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>' +
                '</a>' +
                '<a href="https://www.linkedin.com/in/calee-acupuncture" target="_blank" rel="noopener" aria-label="LinkedIn">' +
                  '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6.9 8.6H3.6V21h3.3V8.6zM5.2 3.2a1.9 1.9 0 100 3.9 1.9 1.9 0 000-3.9zM20.4 21h-3.3v-6.1c0-1.5-.5-2.5-1.9-2.5-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9V21H9.9V8.6h3.3v1.4c.4-.7 1.2-1.7 3-1.7 2.2 0 4.2 1.4 4.2 4.6V21z"/></svg>' +
                '</a>' +
              '</div>' +
            '</div>' +
            '<div>' +
              '<h4>Visit</h4>' +
              '<p>6881 Stanton Ave Ste F (A+ Entrance)<br/>Buena Park, CA 90621</p>' +
              '<a href="sms:+15629078640">(562) 907-8640 &middot; Text/WhatsApp</a>' +
              '<a href="mailto:caleeacu@gmail.com">caleeacu@gmail.com</a>' +
            '</div>' +
            '<div>' +
              '<h4>Explore</h4>' +
              '<a href="about.html">About the Practice</a>' +
              '<a href="services.html">Clinical Services</a>' +
              '<a href="contact.html">Book an Appointment</a>' +
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
