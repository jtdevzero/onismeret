# Three.js

- Version: Three.js 0.160.0 (`r160`), browser UMD build.
- Source: https://github.com/mrdoob/three.js/blob/r160/build/three.min.js
- License: MIT, see `THREE-LICENSE.txt`.

The vendored build is unmodified and exposes `window.THREE`, fitting the existing static application without a new bundler. Only `jackpot-3d.js` loads it, from the same origin. The Páros service worker precaches it for offline use. No CDN or external runtime request is required.
