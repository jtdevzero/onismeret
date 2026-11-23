/* Offline-first 3D minőségpolitika: nem méri a készülék sebességét, óvatos alapbeállításokat ad. */
export const BODYLAB_MODEL_STATUS = Object.freeze({
  procedural: 'illustrative',
  exerciseMotion: 'illustrative',
  detailedAnatomy: 'illustrative',
});

export const BODYLAB_ASSET_POLICY = Object.freeze({
  maximumModelBytes: 8 * 1024 * 1024,
  maximumTextureDimension: 2048,
  allowedExtension: '.glb',
  acceptedMotionStates: ['draft', 'illustrative', 'internally_reviewed', 'reference_checked', 'validated'],
});

export function rendererQuality({ width = 390, devicePixelRatio = 1, reducedMotion = false, deviceMemory = null } = {}) {
  const narrow = Number.isFinite(width) && width < 740;
  const memory = Number(deviceMemory);
  const constrained = Number.isFinite(memory) && memory > 0 && memory <= 2;
  const pixelRatio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  return {
    pixelRatio: Math.min(pixelRatio, constrained ? 1 : narrow ? 1.5 : 2),
    antialias: !constrained,
    animateCamera: !reducedMotion,
    tier: constrained ? 'low' : narrow ? 'medium' : 'high',
  };
}

export function canUseLocalModel(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (typeof entry.path !== 'string' || !/^\.\/assets\/models\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+(?:\.meshopt)?\.glb$/i.test(entry.path)) return false;
  if (!Number.isSafeInteger(entry.bytes) || entry.bytes <= 0 || entry.bytes > BODYLAB_ASSET_POLICY.maximumModelBytes) return false;
  return entry.status === 'illustrative' || entry.status === 'internally_reviewed' || entry.status === 'reference_checked' || entry.status === 'validated';
}
