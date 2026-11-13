# MediaPipe Tasks Vision (vendorolt)

- `vision_bundle.mjs`, `wasm/vision_wasm_internal.{js,wasm}`: az `@mediapipe/tasks-vision` 0.10.21 npm-csomagból, változtatás nélkül. Licenc: Apache-2.0 (Google).
- `pose_landmarker_lite.task`: a MediaPipe Pose Landmarker „lite” modellje (float16, 1-es verzió), forrás: `storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/`. Licenc: Apache-2.0.

Azért vannak a repóban, hogy a videó elemzése a készüléken, külső szerver hívása nélkül és offline is működjön.
Frissítés: töltsd le az új csomagot, cseréld a fájlokat, futtasd a `python3 kanyar/build.py`-t és a teszteket.
