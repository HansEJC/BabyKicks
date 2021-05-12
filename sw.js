importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js');

const { precacheAndRoute, precache, matchPrecache } = workbox.precaching;
const { registerRoute, setCatchHandler, setDefaultHandler } = workbox.routing;
const { CacheFirst, StaleWhileRevalidate, NetworkFirst } = workbox.strategies;
const { CacheableResponse, CacheableResponsePlugin } = workbox.cacheableResponse;
const { ExpirationPlugin } = workbox.expiration;
//const googleAnalytics = workbox.googleAnalytics;
//googleAnalytics.initialize(); //"Uses too much storage, not worth it.

async function cacheKeyWillBeUsed({ request }) {
  const url = new URL(request.url);
  return url.origin + url.pathname;
  // Any search params or hash will be left out.
}

const plugExp = [
  { cacheKeyWillBeUsed },
  new CacheableResponsePlugin({
    statuses: [200],
  }),
  new ExpirationPlugin({
    maxEntries: 60,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
  }),
];

const plugStand = [
  { cacheKeyWillBeUsed }, //same as above
  new CacheableResponsePlugin({
    statuses: [200],
  }),
];

function newRoute(inputs) {
  let { str, name, plugs, strat, typ } = inputs;
  let straTegy = strat === `cache`
    ? new CacheFirst({ cacheName: name, plugins: plugs, })
    : strat === `stale`
      ? new StaleWhileRevalidate({ cacheName: name, plugins: plugs, })
      : new NetworkFirst({ networkTimeoutSeconds: 3, cacheName: name, plugins: plugs, });
  let type = typ === `request`
    ? ({ request }) => request.destination === str
    : typ === `url`
      ? ({ url }) => url.pathname.endsWith(str)
      : ({ url }) => url.pathname.includes(str);
  registerRoute(type, straTegy);
}

newRoute({ str: `image`, name: `images`, plugs: plugExp, strat: `cache`, typ: `request` });
newRoute({ str: `style`, name: `css`, plugs: plugStand, strat: `net`, typ: `request` });
newRoute({ str: `document`, name: `html`, plugs: plugStand, strat: `net`, typ: `request` });
newRoute({ str: `js/ext/`, name: `exScripts`, plugs: plugExp, strat: `cache`, typ: `urlInc` });
newRoute({ str: `script`, name: `scripts`, plugs: plugStand, strat: `net`, typ: `request` });
newRoute({ str: `.csv`, name: `csv`, plugs: plugExp, strat: `cache`, typ: `url` });
newRoute({ str: `.json`, name: `json`, plugs: plugStand, strat: `net`, typ: `url` });
/*
// Use the imported Workbox libraries to implement caching,
// routing, and other logic:
precache([{}],{
});
*/
// Register 'default'
var defaultStrategy = new CacheFirst({
  cacheName: workbox.core.cacheNames.precache,//'workbox-precache-v2',//
  plugins: [
    { cacheKeyWillBeUsed },
    new ExpirationPlugin({
      maxEntries: 128,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
      purgeOnQuotaError: true, // Opt-in to automatic cleanup
    }),
    new CacheableResponsePlugin({
      statuses: [0, 200] // for opague requests
    }),
  ],
});
setDefaultHandler(
  (args) => {

    if (args.event.request.method === 'GET') {
      try {
        return defaultStrategy.handle(args); // use default strategy
      } catch (e) { console.log(e); }
    }
    return fetch(args.event.request);
  }
);

// Catch routing errors, like if the user is offline
setCatchHandler(async ({ event }) => {
  // Return the precached offline page if a document is being requested
  if (event.request.destination === 'document') {
    return matchPrecache('/index.html');
  }
  return Response.error();
});