/* Kézzel rajzolt, sematikus 2D régiók. Nem anatómiai mérési geometria. */
export const BODYLAB_MUSCLE_NAMES = Object.freeze({
  shoulders:'Váll',chest:'Mell',arms:'Kar',core:'Törzs',legs:'Láb',back:'Hát',glutes:'Farizom',
});
export const BODYLAB_MUSCLE_REGIONS = Object.freeze({
  front: Object.freeze([
    ['shoulders', 'M 55 65 Q 37 68 34 88 L 47 101 L 61 81 Z M 105 65 Q 123 68 126 88 L 113 101 L 99 81 Z'],
    ['chest', 'M 62 72 Q 80 81 98 72 L 102 108 Q 80 115 58 108 Z'],
    ['arms', 'M 32 90 L 44 100 L 31 155 L 20 153 Z M 116 100 L 128 90 L 140 153 L 129 155 Z'],
    ['core', 'M 60 114 Q 80 119 100 114 L 96 167 L 64 167 Z'],
    ['legs', 'M 60 184 L 80 184 L 76 269 L 58 269 Z M 81 184 L 100 184 L 102 269 L 84 269 Z'],
  ]),
  back: Object.freeze([
    ['shoulders', 'M 55 65 L 64 80 L 47 103 L 34 88 Z M 105 65 L 96 80 L 113 103 L 126 88 Z'],
    ['back', 'M 64 76 Q 80 82 96 76 L 101 147 Q 80 155 59 147 Z'],
    ['arms', 'M 32 90 L 44 100 L 31 155 L 20 153 Z M 116 100 L 128 90 L 140 153 L 129 155 Z'],
    ['glutes', 'M 60 155 Q 80 160 100 155 L 104 186 Q 80 200 56 186 Z'],
    ['legs', 'M 60 194 L 80 194 L 76 269 L 58 269 Z M 81 194 L 100 194 L 102 269 L 84 269 Z'],
  ]),
});

export function bodylabRegionsForView(view = 'front') {
  return BODYLAB_MUSCLE_REGIONS[view] || BODYLAB_MUSCLE_REGIONS.front;
}
