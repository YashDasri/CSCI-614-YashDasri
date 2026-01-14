// Small, focused JS for nav toggle, year injection, smooth scrolling, and section navigation
(function(){
  'use strict'
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  toggle && toggle.addEventListener('click', function(){
    var expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!expanded));
    if(nav) nav.style.display = expanded ? 'none' : 'block';
  });

  // Insert current year
  var y = new Date().getFullYear();
  var yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = y;

  /* ---------------- Section navigation (prev/next + nav sync) ---------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main .section'));
  var currentIndex = 0;
  // Map section hash -> index and nav links
  var sectionIdToIndex = {};
  sections.forEach(function(s, i){ if(s.id) sectionIdToIndex['#' + s.id] = i; });
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));

  function updateActiveNav(){
    navLinks.forEach(function(link){ link.classList.remove('is-active'); });
    var activeLink = navLinks.find(function(l){ return sectionIdToIndex[l.getAttribute('href')] === currentIndex; });
    if(activeLink) activeLink.classList.add('is-active');
  }

  // Smooth scroll for internal links — route through goToIndex so active nav syncs
  document.addEventListener('click', function(e){
    var el = e.target.closest('a[href^="#"]');
    if(!el) return;
    var href = el.getAttribute('href');
    if(href === '#' || href === '#0') return;
    var target = document.querySelector(href);
    if(target){
      e.preventDefault();
      var idx = sectionIdToIndex[href];
      if(typeof idx !== 'undefined'){
        goToIndex(idx);
      } else {
        target.scrollIntoView({behavior:'smooth',block:'start'});
      }
      // close mobile nav after click
      if(window.innerWidth <= 900 && nav){
        nav.style.display = 'none';
        if(toggle) toggle.setAttribute('aria-expanded','false');
      }
    }
  });

  function updateCurrentIndexFromScroll(){
    var headerOffset = getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '72px';
    var offset = parseInt(headerOffset,10) || 72;
    var scrollPos = window.scrollY + offset + 10; // consider header offset
    for(var i=0;i<sections.length;i++){
      var top = sections[i].offsetTop;
      var bottom = top + sections[i].offsetHeight;
      if(scrollPos >= top && scrollPos < bottom){
        if(currentIndex !== i){ currentIndex = i; updateActiveNav(); updateSectionNavButtons(); }
        break;
      }
    }
  }

  function goToIndex(idx){
    idx = Math.max(0, Math.min(sections.length-1, idx));
    var target = sections[idx];
    var headerOffset = getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '72px';
    var offset = parseInt(headerOffset,10) || 72;
    var targetY = target.offsetTop - offset + 4; // small gap below header
    window.scrollTo({top: targetY, behavior: 'smooth'});
    currentIndex = idx;
    updateActiveNav();
    updateSectionNavButtons();
  }

  var prevBtn = document.getElementById('nav-prev');
  var nextBtn = document.getElementById('nav-next');
  prevBtn && prevBtn.addEventListener('click', function(){ goToIndex(currentIndex-1); });
  nextBtn && nextBtn.addEventListener('click', function(){ goToIndex(currentIndex+1); });

  function updateSectionNavButtons(){
    if(!prevBtn || !nextBtn) return;
    if(currentIndex <= 0){ prevBtn.style.display = 'none'; } else { prevBtn.style.display = ''; }
    if(currentIndex >= sections.length-1){ nextBtn.style.display = 'none'; } else { nextBtn.style.display = ''; }
  }

  // Keyboard navigation (left/right)
  document.addEventListener('keydown', function(e){
    if(e.key === 'ArrowRight') { goToIndex(currentIndex+1); }
    if(e.key === 'ArrowLeft') { goToIndex(currentIndex-1); }
  });

  // Update currentIndex on scroll (throttled)
  var ticking = false;
  window.addEventListener('scroll', function(){
    if(!ticking){
      window.requestAnimationFrame(function(){
        updateCurrentIndexFromScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Touch swipe support for mobile (left/right)
  (function(){
    var touchStartX = null;
    var touchStartY = null;
    var threshold = 50; // px
    window.addEventListener('touchstart', function(e){
      var t = e.changedTouches[0];
      touchStartX = t.screenX; touchStartY = t.screenY;
    }, {passive:true});
    window.addEventListener('touchend', function(e){
      if(touchStartX === null) return;
      var t = e.changedTouches[0];
      var dx = t.screenX - touchStartX;
      var dy = t.screenY - touchStartY;
      if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold){
        if(dx < 0) goToIndex(currentIndex+1); else goToIndex(currentIndex-1);
      }
      touchStartX = null; touchStartY = null;
    }, {passive:true});
  })();

  // Initialize active nav and section buttons based on current scroll position on load
  window.addEventListener('load', function(){ updateCurrentIndexFromScroll(); updateActiveNav(); updateSectionNavButtons(); });

  // Contact form handler (client-side only)
  var contactForm = document.getElementById('contact-form');
  var contactStatus = document.getElementById('contact-status');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = contactForm.querySelector('#name');
      var email = contactForm.querySelector('#email');
      var message = contactForm.querySelector('#message');
      if(!name.value.trim() || !email.value.trim() || !message.value.trim()){
        contactStatus.textContent = 'Please fill the required fields.';
        contactStatus.style.color = 'crimson';
        return;
      }
      // Mock success
      contactStatus.style.color = '';
      contactStatus.textContent = 'Thanks — your message was received (demo).';
      contactForm.reset();
    });
  }

})();
