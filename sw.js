const CACHE='tonninyira-shell-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./apple-touch-icon.png','./payment-return.html'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim())});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==location.origin) return;
  event.respondWith(
    caches.match(req).then(cached=>cached||fetch(req).then(res=>{
      if(res.ok && (req.mode==='navigate'||url.pathname.endsWith('.css')||url.pathname.endsWith('.js')||url.pathname.endsWith('.webmanifest'))){
        const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));
      }
      return res;
    }).catch(()=>cached||caches.match('./index.html')))
  );
});