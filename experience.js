(() => {
const THREE = window.THREE;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

// A real-time, pointer-led glass study. The original CSS sculpture remains as a no-WebGL fallback.
const canvas = document.querySelector('#hero-canvas');
const stage = document.querySelector('#hero-visual');
if (THREE && canvas && stage && !reduceMotion) {
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
    else renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, stage.clientWidth / stage.clientHeight, .1, 100);
    camera.position.set(0, 0, 8.6);
    scene.add(new THREE.HemisphereLight(0xf7ffff, 0x9aaec1, 2.5));
    const key = new THREE.PointLight(0xffffff, 38, 18); key.position.set(-3.5, 3.8, 5); scene.add(key);
    const tealLight = new THREE.PointLight(0x5fcec1, 30, 12); tealLight.position.set(3, -2, 3); scene.add(tealLight);
    const world = new THREE.Group(); scene.add(world);

    const crystal = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.18, 1),
      new THREE.MeshPhysicalMaterial({ color: 0x268b87, metalness: .2, roughness: .24, transmission: 0, clearcoat: .8, clearcoatRoughness: .1, emissive: 0x165d5d, emissiveIntensity: .3, flatShading: true })
    );
    crystal.position.set(2.45, .82, .15); crystal.scale.setScalar(1.22); world.add(crystal);
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.205, 1), new THREE.MeshBasicMaterial({ color: 0x1d7778, wireframe: true, transparent: true, opacity: .78 }));
    wire.position.copy(crystal.position); wire.scale.setScalar(1.22); world.add(wire);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.23, 1)), new THREE.LineBasicMaterial({ color: 0x155f62, transparent: true, opacity: .92 }));
    edges.position.copy(crystal.position); edges.scale.setScalar(1.22); world.add(edges);

    const core = new THREE.Mesh(new THREE.SphereGeometry(.36, 32, 32), new THREE.MeshPhysicalMaterial({ color: 0xf9ffff, metalness: .22, roughness: .1, clearcoat: 1, emissive: 0x8dd7cf, emissiveIntensity: .16 }));
    core.position.set(2.35, .82, 1.48); world.add(core);
    const satellites = [
      { position: [3.6, 1.62, .55], radius: .085 },
      { position: [.72, -.65, .8], radius: .055 },
      { position: [3.25, -.58, -.42], radius: .045 }
    ].map(({ position, radius }, index) => {
      const satellite = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 18), new THREE.MeshBasicMaterial({ color: index === 1 ? 0x8c9ac0 : 0x43aaa5 }));
      satellite.position.set(...position); satellite.userData.homeY = position[1]; world.add(satellite); return satellite;
    });
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0x4b989b, transparent: true, opacity: .45 });
    const orbitA = new THREE.Mesh(new THREE.TorusGeometry(1.75, .012, 8, 180), orbitMat); orbitA.rotation.set(.96, .18, -.47); orbitA.position.set(2.35, .72, -.08); world.add(orbitA);
    const orbitB = new THREE.Mesh(new THREE.TorusGeometry(2.08, .009, 8, 180), new THREE.MeshBasicMaterial({ color: 0x758ca8, transparent: true, opacity: .42 })); orbitB.rotation.set(.15, 1.02, .68); orbitB.position.copy(orbitA.position); world.add(orbitB);

    const count = finePointer ? 140 : 70;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - .5) * 6.6;
      positions[i * 3 + 1] = (Math.random() - .5) * 5.8;
      positions[i * 3 + 2] = (Math.random() - .5) * 3 - 1.2;
    }
    const particleGeo = new THREE.BufferGeometry(); particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: 0x73bdb6, size: .025, transparent: true, opacity: .64, sizeAttenuation: true })); scene.add(particles);

    const pointer = new THREE.Vector2();
    const target = new THREE.Vector2();
    const crystalScale = new THREE.Vector3(1, 1, 1);
    const raycaster = new THREE.Raycaster();
    let objectHovered = false;
    if (finePointer) stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / rect.width - .5) * 2;
      target.y = -((event.clientY - rect.top) / rect.height - .5) * 2;
      pointer.copy(target);
      raycaster.setFromCamera(pointer, camera);
      objectHovered = raycaster.intersectObject(crystal, false).length > 0;
      stage.classList.toggle('scene-hover', objectHovered);
      document.body.classList.toggle('cursor-hover', objectHovered);
    }, { passive: true });
    stage.addEventListener('pointerleave', () => { target.set(0, 0); objectHovered = false; stage.classList.remove('scene-hover'); document.body.classList.remove('cursor-hover'); }, { passive: true });

    let visible = true;
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    visibility.observe(stage);
    const resize = new ResizeObserver(() => {
      const width = stage.clientWidth, height = stage.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
    });
    resize.observe(stage);

    const clock = new THREE.Clock();
    const render = () => {
      requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      const t = clock.getElapsedTime();
      pointer.lerp(target, .045);
      world.rotation.y += ((pointer.x * .22 + Math.sin(t * .22) * .035) - world.rotation.y) * .025;
      world.rotation.x += ((-pointer.y * .16 + Math.cos(t * .2) * .025) - world.rotation.x) * .025;
      camera.position.x += (pointer.x * .24 - camera.position.x) * .025;
      camera.position.y += (pointer.y * .16 - camera.position.y) * .025;
      camera.lookAt(0, 0, 0);
      crystal.rotation.x = t * .12; crystal.rotation.z = Math.sin(t * .24) * .09;
      const hoverScale = objectHovered ? 1.34 : 1.22;
      crystal.scale.lerp(crystalScale.setScalar(hoverScale), .08);
      tealLight.intensity += ((objectHovered ? 48 : 25) - tealLight.intensity) * .06;
      wire.rotation.copy(crystal.rotation); edges.rotation.copy(crystal.rotation); core.scale.setScalar(1 + Math.sin(t * 1.1) * .035);
      satellites.forEach((satellite, index) => { satellite.position.y = satellite.userData.homeY + Math.sin(t * .7 + index) * .06; });
      orbitA.rotation.z += .0013; orbitB.rotation.x -= .0006;
      particles.rotation.y = t * .012;
      renderer.render(scene, camera);
    };
    render();
    canvas.classList.add('is-live');
  } catch (error) {
    // Keep the built-in CSS artwork visible if WebGL is unavailable.
  }
}

// Cursor illumination and spring-like magnetic pull on primary actions.
if (finePointer && !reduceMotion) {
  let pointerX = innerWidth / 2, pointerY = innerHeight / 2;
  addEventListener('pointermove', (event) => {
    pointerX = event.clientX; pointerY = event.clientY;
    document.documentElement.style.setProperty('--pointer-x', `${pointerX}px`);
    document.documentElement.style.setProperty('--pointer-y', `${pointerY}px`);
  }, { passive: true });
  if (gsap) document.querySelectorAll('.magnetic').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      gsap.to(button, { x: (event.clientX - rect.left - rect.width / 2) * .13, y: (event.clientY - rect.top - rect.height / 2) * .18, duration: .35, ease: 'power3.out' });
    });
    button.addEventListener('pointerleave', () => gsap.to(button, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.45)' }));
  });
}

// A pinned horizontal chapter on large screens; native swipe cards remain on mobile.
const story = document.querySelector('.story-section');
const track = document.querySelector('.story-track');
if (story && track && innerWidth > 720 && !reduceMotion && gsap && ScrollTrigger) {
  story.classList.add('is-motion');
  const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
  gsap.to(track, {
    x: () => -distance(), ease: 'none',
    scrollTrigger: { trigger: story, start: 'top top', end: () => `+=${distance() + innerHeight * .7}`, pin: '.story-pin', scrub: .8, invalidateOnRefresh: true }
  });
}

// Each content family gets its own entrance rhythm rather than one repeated fade.
if (!reduceMotion && gsap) {
  const heroTitle = document.querySelector('#hero-title');
  if (heroTitle) {
    heroTitle.querySelectorAll('.hero-line').forEach((line) => {
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        [...node.textContent].forEach((character) => {
          const glyph = document.createElement('span');
          glyph.className = 'hero-glyph';
          glyph.textContent = character === ' ' ? '\u00a0' : character;
          fragment.append(glyph);
        });
        node.replaceWith(fragment);
      });
    });
    gsap.from('#hero-title .hero-glyph', { yPercent: 110, rotateX: -45, opacity: 0, duration: .9, stagger: .022, delay: .22, ease: 'power4.out' });
  }
}
})();
