/* Only static application files are cached; no form submissions or personal records. */
const PREFIX=`kingsword:${new URL(self.registration.scope).pathname}:`;
const CACHE=PREFIX+'__BUILD_ID__';
const FILES=['./','./index.html','./styles.css','./app.js','./domain.mjs','./manifest.webmanifest','./assets/mark.svg','./assets/icon-192.png','./assets/icon-512.png'];
const ASSETS=new Set(FILES.map(file=>new URL(file,self.registration.scope).href));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([...ASSETS])).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||!ASSETS.has(event.request.url))return;
 event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}return response;}).catch(()=>caches.match(event.request)));
});
