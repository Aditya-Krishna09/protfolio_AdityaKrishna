(() => {
  document.documentElement.classList.add('motion-enabled');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  const progress = document.querySelector('.scroll-progress span');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let ringX = pointerX;
  let ringY = pointerY;



  if (document.getElementById('year')) {
    document.getElementById('year').textContent = new Date().getFullYear();
  }

  // Mobile navigation
  menuToggle?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }));

  // Reveal sections as they enter the viewport.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Scroll progress bar.
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const amount = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, amount))}%`;
  };
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // A full-page cinematic sequence, scrubbed by scroll and kept in a small decode cache.
  const filmCanvas = document.getElementById('scroll-film');
  if (filmCanvas) {
    const context = filmCanvas.getContext('2d', { alpha: false, desynchronized: true });
    const frameCount = 118;
    const cache = new Map();
    const pending = new Set();
    const reducedMotion = prefersReduced;
    let targetFrame = 0;
    let currentFrame = 0;
    let renderedFrame = -1;
    let drawQueued = false;
    let rafPending = false;
    let active = true;
    const scheduleFilm = () => {
      if (active && !rafPending) {
        rafPending = true;
        requestAnimationFrame(animateFilm);
      }
    };

    const resizeFilm = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      filmCanvas.width = Math.round(innerWidth * ratio);
      filmCanvas.height = Math.round(innerHeight * ratio);
      filmCanvas.style.width = `${innerWidth}px`;
      filmCanvas.style.height = `${innerHeight}px`;
      drawQueued = true;
      scheduleFilm();
    };
    const loadFrame = (index) => {
      const frame = Math.max(0, Math.min(frameCount - 1, index));
      if (cache.has(frame) || pending.has(frame)) return;
      pending.add(frame);
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        pending.delete(frame);
        cache.set(frame, image);
        while (cache.size > 6) {
          const oldest = cache.keys().next().value;
          if (oldest === frame) break;
          cache.delete(oldest);
        }
        drawQueued = true;
        scheduleFilm();
      };
      image.onerror = () => pending.delete(frame);
      image.src = `assets/scroll-sequence/ezgif-frame-${String(frame + 1).padStart(3, '0')}.jpg`;
    };
    const drawFrame = (index) => {
      const image = cache.get(index);
      if (!image || !context) return false;
      const width = filmCanvas.width, height = filmCanvas.height;
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const sw = width / scale, sh = height / scale;
      const sx = (image.naturalWidth - sw) / 2;
      const sy = (image.naturalHeight - sh) / 2;
      context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
      renderedFrame = index;
      return true;
    };
    const updateFilmTarget = () => {
      const scrollable = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      targetFrame = reducedMotion ? 0 : Math.round((scrollY / scrollable) * (frameCount - 1));
      loadFrame(targetFrame);
      loadFrame(targetFrame + 1);
      loadFrame(targetFrame + 2);
      loadFrame(Math.max(0, targetFrame - 1));
      drawQueued = true;
      scheduleFilm();
    };
    const animateFilm = () => {
      rafPending = false;
      if (!active) return;
      currentFrame += (targetFrame - currentFrame) * (reducedMotion ? 1 : .16);
      const frameToDraw = Math.round(currentFrame);
      if (frameToDraw !== renderedFrame) drawQueued = true;
      if (drawQueued) {
        drawQueued = false;
        if (!drawFrame(frameToDraw) && renderedFrame < 0) loadFrame(0);
      }
      if (Math.abs(targetFrame - currentFrame) > .08) scheduleFilm();
    };
    resizeFilm();
    loadFrame(0);
    updateFilmTarget();
    addEventListener('resize', resizeFilm, { passive: true });
    addEventListener('scroll', updateFilmTarget, { passive: true });
    document.addEventListener('visibilitychange', () => { active = !document.hidden; if (active) scheduleFilm(); });
    scheduleFilm();
  }

  // Cursor follows pointer with a soft trailing ring on precise-pointer devices.
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (hasFinePointer && !prefersReduced && cursorDot && cursorRing) {
    document.body.classList.add('cursor-ready');
    window.addEventListener('pointermove', (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      cursorDot.style.left = `${pointerX}px`;
      cursorDot.style.top = `${pointerY}px`;
    }, { passive: true });
    const animateRing = () => {
      ringX += (pointerX - ringX) * 0.18;
      ringY += (pointerY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(animateRing);
    };
    requestAnimationFrame(animateRing);
    document.querySelectorAll('a, button, .tilt-card').forEach((target) => {
      target.addEventListener('pointerenter', () => document.body.classList.add('cursor-hover'));
      target.addEventListener('pointerleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // Gentle tilt on the hero portrait and project cards.
  if (hasFinePointer && !prefersReduced) {
    document.querySelectorAll('.tilt-card, .project-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const intensity = card.classList.contains('tilt-card') ? 5 : 2.6;
        card.style.transform = `perspective(900px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) translateY(-2px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }


  // Interactive 3D-style hero: pointer depth and gentle scroll drift.
  const hero = document.querySelector('.hero');
  const sculpture = document.querySelector('.hero-sculpture');
  if (hero && sculpture && hasFinePointer && !prefersReduced) {
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      sculpture.style.setProperty('--scene-x', `${x * 16}deg`);
      sculpture.style.setProperty('--scene-y', `${-y * 13}deg`);
      sculpture.style.setProperty('--scene-dx', `${x * 14}px`);
      sculpture.style.setProperty('--scene-dy', `${y * 14}px`);
    }, {passive:true});
    hero.addEventListener('pointerleave', () => {
      sculpture.style.setProperty('--scene-x', '0deg'); sculpture.style.setProperty('--scene-y', '0deg');
      sculpture.style.setProperty('--scene-dx', '0px'); sculpture.style.setProperty('--scene-dy', '0px');
    });
  }
  const chapterLinks = [...document.querySelectorAll('.chapter-link')];
  const chapterTargets = ['top','about','experience','work','journey','contact'].map(id=>document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window && chapterLinks.length) {
    const chapterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          chapterLinks.forEach(link=>link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, {rootMargin:'-38% 0px -48% 0px'});
    chapterTargets.forEach(target=>chapterObserver.observe(target));
  }
  // Scroll-based depth movement on the portrait stage.
  const updateHeroDrift = () => {
    if (!hero || prefersReduced) return;
    const r = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));
    hero.style.setProperty('--hero-scroll', progress.toFixed(3));
  };
  window.addEventListener('scroll', updateHeroDrift, {passive:true}); updateHeroDrift();

  // Project filters.
  const filterButtons = document.querySelectorAll('.filter-button');
  const projectCards = document.querySelectorAll('.project-card');
  filterButtons.forEach((button) => button.addEventListener('click', () => {
    filterButtons.forEach((item) => {
      item.classList.remove('active');
      item.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
    const filter = button.dataset.filter;
    projectCards.forEach((card) => {
      const matches = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-hidden', !matches);
    });
  }));

  // Count-up highlights; reduced-motion users see the final value immediately.
  const counters = document.querySelectorAll('[data-count]');
  const animateCounter = (element) => {
    const target = Number(element.dataset.count || 0);
    const suffix = element.dataset.suffix || '';
    if (prefersReduced) {
      element.textContent = `${target}${suffix}`;
      return;
    }
    const duration = 900;
    const start = performance.now();
    const frame = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.7 });
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }
})();
