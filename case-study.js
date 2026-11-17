
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bar = document.querySelector('.scroll-progress span');
  const stage = document.querySelector('.case-art-stage');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  if (stage && !reduce && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      const core = stage.querySelector('.case-art-core');
      if (core) core.style.transform = `rotateX(${12-y*12}deg) rotateY(${-19+x*16}deg) rotateZ(${-7+x*4}deg) translateY(-4px)`;
    });
    stage.addEventListener('pointerleave', () => { const core=stage.querySelector('.case-art-core'); if(core) core.style.transform=''; });
  }
  const reveals=document.querySelectorAll('.case-reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io=new IntersectionObserver((entries,obs)=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target);}}),{threshold:.12});
    reveals.forEach(el=>io.observe(el));
  } else reveals.forEach(el=>el.classList.add('is-visible'));
  const yr=document.getElementById('year'); if(yr) yr.textContent=new Date().getFullYear();
})();
