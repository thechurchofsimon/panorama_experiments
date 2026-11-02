const CACHE='roman-portals-field-v1';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 e.respondWith((async()=>{
 const cache=await caches.open(CACHE);
 const cached=await cache.match(e.request.url);
 if(!cached)return fetch(e.request);
 const range=e.request.headers.get('Range');
 if(!range)return cached;
 const bytes=await cached.arrayBuffer(),size=bytes.byteLength;
 const m=/^bytes=(\d*)-(\d*)$/.exec(range);
 if(!m)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
 let start=m[1]?Number(m[1]):Math.max(0,size-Number(m[2]));
 let end=m[1]?(m[2]?Math.min(Number(m[2]),size-1):size-1):size-1;
 if(start>end||start>=size)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
 return new Response(bytes.slice(start,end+1),{status:206,headers:{
 'Content-Type':cached.headers.get('Content-Type')||'application/octet-stream',
 'Content-Range':'bytes '+start+'-'+end+'/'+size,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
 })());
});