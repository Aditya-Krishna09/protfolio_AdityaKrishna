// main.js – initialize AOS and live cursor trail

// Initialize AOS (Animate On Scroll) – using CDN loaded in HTML
if (typeof AOS !== 'undefined') {
  AOS.init({ once: true, duration: 800 });
}

// Live cursor trail (canvas)
(function(){
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const points = [];
  const max = 15;
  window.addEventListener('resize',()=>{canvas.width=innerWidth;canvas.height=innerHeight;});
  window.addEventListener('mousemove',e=>{
    points.push({x:e.clientX, y:e.clientY});
    if (points.length>max) points.shift();
  });
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    points.forEach((p,i)=>{
      const alpha = (i+1)/points.length;
      ctx.fillStyle = `rgba(0,150,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x,p.y,5*alpha,0,Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();
