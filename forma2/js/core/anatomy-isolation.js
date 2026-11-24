/* Az anatómiai izolálás kizárólag megjelenítési állapotot változtat.
   A betöltött GLB eredeti láthatósági rétegeit visszaállíthatóan megőrzi. */
export function createAnatomyIsolation(meshes = []) {
  const original = new Map();
  for (const mesh of meshes) {
    if (mesh && typeof mesh.visible === 'boolean' && !original.has(mesh)) {
      original.set(mesh, mesh.visible);
    }
  }
  let isolated = null;
  const restore = () => {
    for (const [mesh, visible] of original) mesh.visible = visible;
    isolated = null;
  };
  const isolate = mesh => {
    if (!original.has(mesh) || !original.get(mesh)) return false;
    for (const [entry] of original) entry.visible = entry === mesh;
    isolated = mesh;
    return true;
  };
  const toggle = mesh => {
    if (isolated === mesh) { restore(); return false; }
    return isolate(mesh);
  };
  return {
    restore, isolate, toggle,
    isIsolated: () => isolated !== null,
    isolatedMesh: () => isolated,
  };
}
