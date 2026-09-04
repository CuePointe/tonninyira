(function(){
  'use strict';
  const validMarketImages = [1,2,3,4,5,6].concat(Array.from({length:20},(_,i)=>i+11));
  const base='assets/market/';

  function addStyles(){
    if(document.getElementById('tn-market-gallery-fix-style')) return;
    const s=document.createElement('style'); s.id='tn-market-gallery-fix-style'; s.textContent=`
      #marketBanner .hero-gallery{background:#2a1f19;position:relative;overflow:hidden}
      #marketBanner .hero-track{height:100%;display:flex}
      #marketBanner .tn-market-slide{min-width:100%;height:100%;position:relative;display:block}
      #marketBanner .tn-market-slide img{width:100%;height:100%;display:block;object-fit:cover}
      #marketBanner .tn-market-caption{position:absolute;left:12px;bottom:12px;right:12px;padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.58);color:#fff;font-size:.78rem;font-weight:700;text-shadow:0 1px 2px rgba(0,0,0,.5)}
      #marketBanner .tn-market-dots{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);display:flex;gap:5px;z-index:5}
      #marketBanner .tn-market-dots span{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.45)}
      #marketBanner .tn-market-dots span.active{background:#f5b400;transform:scale(1.25)}
    `; document.head.appendChild(s);
  }

  function build(){
    const banner=document.getElementById('marketBanner');
    const gallery=banner && banner.querySelector('.hero-gallery');
    const track=gallery && gallery.querySelector('.hero-track');
    if(!gallery || !track) return false;
    addStyles();
    const existingDots=gallery.querySelector('.tn-market-dots');
    if(existingDots) existingDots.remove();
    track.innerHTML=validMarketImages.map((n,i)=>`<div class="tn-market-slide"><img src="${base}${n}.jpg" alt="Tonninyira market view ${n}" loading="${i<2?'eager':'lazy'}"><div class="tn-market-caption">Real market view · Kampala</div></div>`).join('');
    const dots=document.createElement('div'); dots.className='tn-market-dots'; dots.innerHTML=validMarketImages.map((_,i)=>`<span class="${i===0?'active':''}"></span>`).join(''); gallery.appendChild(dots);
    let index=0;
    const render=()=>{track.style.transform=`translateX(-${index*100}%)`; [...dots.children].forEach((d,i)=>d.classList.toggle('active',i===index));};
    render();
    setInterval(()=>{index=(index+1)%validMarketImages.length;render();},4500);
    return true;
  }

  function start(){
    let attempts=0;
    const timer=setInterval(()=>{attempts++;if(build()||attempts>20)clearInterval(timer);},250);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
