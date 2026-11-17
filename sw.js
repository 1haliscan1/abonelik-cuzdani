// Abonelik Cüzdanı service worker: kabuk önbellekten, kampanyalar önce ağdan
const V="ac-v3";
const SHELL=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url),same=u.origin===location.origin,font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!same&&!font)return;
  if(same&&u.pathname.endsWith("campaigns.json")){ // güncel veri önemli: önce ağ, olmazsa son kopya
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put("campaigns.json",cp));return res}).catch(()=>caches.match("campaigns.json")));return}
  // kabuk ve yazı tipleri: önbellekten hemen, arkada tazele
  e.respondWith(caches.match(r,{ignoreSearch:same}).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque")){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
    return hit||net}));
});
