/* Service worker del menu: lo deja abrible sin senal.
   Generado por hacer_publico.py - no editar a mano. */
'use strict';

var CACHE = 'apps-3ba1b648';
var ARCHIVOS = ["./", "index.html", "styles.css", "logo.svg", "manifest.webmanifest"];

self.addEventListener('install', function (ev) {
  ev.waitUntil(
    caches.open(CACHE).then(function (c) {
      // Uno por uno, no todo-o-nada: con addAll un solo archivo que falle deja
      // el telefono sin cache y sin modo offline.
      return Promise.all(ARCHIVOS.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () { return null; });
      })).then(function () {
        return c.match('index.html');
      }).then(function (nucleo) {
        // Sin la pagina no hay app: se falla la instalacion a proposito para que
        // el service worker viejo siga sirviendo y se reintente despues.
        if (!nucleo) throw new Error('no se pudo guardar la pagina');
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (ev) {
  ev.waitUntil(
    caches.keys().then(function (claves) {
      return Promise.all(claves.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (ev) {
  if (ev.request.method !== 'GET') return;
  // Primero lo guardado (puede no haber senal) y de fondo se refresca.
  ev.respondWith(
    caches.match(ev.request).then(function (guardado) {
      var red = fetch(ev.request).then(function (r) {
        if (r && r.ok && r.type === 'basic') {
          var copia = r.clone();
          caches.open(CACHE).then(function (c) { c.put(ev.request, copia); });
        }
        return r;
      }).catch(function () {
        return guardado || caches.match('index.html');
      });
      return guardado || red;
    })
  );
});
