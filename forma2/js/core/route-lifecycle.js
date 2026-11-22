/* A képernyőnként regisztrált erőforrások és az aszinkron navigáció elkülönítése. */
export function createRouteLifecycle(onError = () => {}) {
  let active = null;
  function begin() {
    if (active) active.dispose();
    let disposed = false;
    const cleanups = [];
    const scope = {
      onCleanup(fn) {
        if (typeof fn !== 'function') return;
        if (disposed) { try { fn(); } catch (e) { onError(e); } }
        else cleanups.push(fn);
      },
      isActive: () => !disposed && active === scope,
      dispose() {
        if (disposed) return;
        disposed = true;
        for (const fn of cleanups.splice(0).reverse()) {
          try { fn(); } catch (e) { onError(e); }
        }
      },
    };
    active = scope;
    return scope;
  }
  return { begin };
}
