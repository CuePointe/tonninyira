(() => {
  const root = document.getElementById('marketSlider');
  const track = document.getElementById('marketSlides');
  const dots = document.getElementById('marketDots');
  const prev = document.getElementById('marketPrev');
  const next = document.getElementById('marketNext');
  if (!root || !track || !dots) return;

  const candidates = Array.from({length: 30}, (_, i) => `assets/market/${i + 1}.jpg`);
  const valid = [];

  const probe = (src, index) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 1 && img.naturalHeight > 1) valid.push({src, index});
      resolve();
    };
    img.onerror = () => resolve();
    img.src = src;
  });

  let current = 0;
  let timer = null;

  const render = () => {
    track.innerHTML = valid.map(({src, index}, n) => `<div class="market-slide${n === 0 ? ' active' : ''}" data-slide="${n}"><img src="${src}" alt="Tonninyira market image ${index}" loading="${n === 0 ? 'eager' : 'lazy'}"></div>`).join('');
    dots.innerHTML = valid.map((_, n) => `<button class="market-dot${n === 0 ? ' active' : ''}" type="button" aria-label="Show market image ${n + 1}" data-slide-to="${n}"></button>`).join('');
    if (valid.length <= 1) {
      if (prev) prev.hidden = true;
      if (next) next.hidden = true;
      dots.hidden = true;
      return;
    }
    dots.querySelectorAll('[data-slide-to]').forEach(btn => btn.onclick = () => go(Number(btn.dataset.slideTo)));
    if (prev) prev.onclick = () => go(current - 1);
    if (next) next.onclick = () => go(current + 1);
    start();
  };

  const go = n => {
    if (!valid.length) return;
    current = (n + valid.length) % valid.length;
    track.querySelectorAll('.market-slide').forEach((el, i) => el.classList.toggle('active', i === current));
    dots.querySelectorAll('.market-dot').forEach((el, i) => el.classList.toggle('active', i === current));
  };

  const start = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(() => go(current + 1), 4500);
  };

  Promise.all(candidates.map(probe)).then(() => {
    valid.sort((a, b) => a.index - b.index);
    if (!valid.length) {
      root.classList.add('hidden');
      return;
    }
    render();
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, {passive:true});
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) go(current + (dx < 0 ? 1 : -1));
    }, {passive:true});
    root.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
    root.addEventListener('mouseleave', start);
  });
})();
