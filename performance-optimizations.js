/* Tonninyira performance layer.
 * Keeps the existing UI/flow but reduces image work during first paint.
 * The market hero intentionally uses a small, known-good set and lazy-loads
 * only the slide entering the viewport instead of probing many files.
 */
(function(){
  'use strict';
  const HERO_IMAGES = [1,2,3,4,5,6];
  const base = 'assets/market/';

  function addStyle(){
    if(document.getElementById('tn-performance-style')) return;
    const s=document.createElement('style'); s.id='tn-performance-style';
    s.textContent=`
      img{content-visibility:auto}
      .gallery-item img,.gallery-item video{contain:layout paint style}
      .hero-slide img,.tn-market-slide img{background:#33261c}
    `;
    document.head.appendChild(s);
  }

  function optimizeHero(){
    const banner=document.getElementById('marketBanner');
    const gallery=banner && banner.querySelector('.hero-gallery');
    const track=gallery && gallery.querySelector('.hero-track');
    if(!gallery || !track) return false;
    if(gallery.dataset.tnOptimized==='1') return true;
    gallery.dataset.tnOptimized='1';
    addStyle();

    const slides=HERO_IMAGES.map((n,i)=>`<div class="tn-market-slide hero-slide"><img src="${base}${n}.jpg" alt="Tonninyira market view ${n}" ${i===0?'loading="eager" fetchpriority="high"':'loading="lazy"'} decoding="async"><div class="tn-market-caption hero-caption">Real market view · Kampala</div></div>`).join('');
    track.innerHTML=slides;
    const oldDots=gallery.querySelector('.tn-market-dots'); if(oldDots) oldDots.remove();
    const dots=document.createElement('div'); dots.className='tn-market-dots hero-dots';
    dots.innerHTML=HERO_IMAGES.map((_,i)=>`<span class="${i===0?'active':''}"></span>`).join('');
    gallery.appendChild(dots);
    let index=0;
    const render=()=>{track.style.transform=`translateX(-${index*100}%)`;[...dots.children].forEach((d,i)=>d.classList.toggle('active',i===index));};
    render();
    let timer=0;
    const advance=()=>{index=(index+1)%HERO_IMAGES.length;render();};
    const start=()=>{if(timer) clearInterval(timer);timer=setInterval(advance,5000)};
    const stop=()=>{if(timer){clearInterval(timer);timer=0}};
    gallery.addEventListener('mouseenter',stop); gallery.addEventListener('mouseleave',start);
    gallery.addEventListener('touchstart',stop,{passive:true}); gallery.addEventListener('touchend',start,{passive:true});
    start();
    return true;
  }

  function lazyVendorMedia(){
    document.querySelectorAll('.gallery-item img').forEach(img=>{img.loading='lazy';img.decoding='async';});
    document.querySelectorAll('.gallery-item video').forEach(v=>{v.preload='none';});
    document.querySelectorAll('.stall-card .avatar').forEach(img=>{if(img.tagName==='IMG'){img.loading='lazy';img.decoding='async';}});
  }

  function start(){
    addStyle();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const ready=optimizeHero();
      lazyVendorMedia();
      if(ready || tries>30) clearInterval(timer);
    },200);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
