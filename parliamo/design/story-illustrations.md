# Story illustrations

The first illustrated serial is **The Archive / Az archívum**, `s3` in
`data/serials-en.json`. The story explicitly takes place in a London archive.
The other English serials remain in their actual settings: Edinburgh/Glasgow
for *The Missing Painting* and Austin for *The Startup*.

## Coherent cast and setting

The story supplies the names and actions. The following are illustration
directions, not added course facts:

- Helen Marsh: about 38, dark brown bob, round tortoiseshell glasses, olive
  cardigan over an ivory blouse.
- Daniel: about 32, short curly dark hair, navy crewneck and rust overshirt.
- The visitor: about 50, neatly combed silver hair, charcoal suit.
- A London institutional archive: warm oak desks, green reading lamps, tall
  sash windows, cream stone, dusty blue and warm gold. Keep faces, clothes,
  furniture and the folder consistent between panels.

## Atlas

Asset: `img/story-s3-scenes.webp`. A 1536 × 1024 image contains a 3-column,
2-row grid of six **square** scenes, without gutters, borders or writing.
Read left to right, then top to bottom. No manual crop is needed.
`src/js/68-story-art.js` supplies the scene descriptions and positions;
the viewport is square with a background size of 300% × 200%.

| Chapter | Illustration beat | Background position |
| --- | --- | --- |
| 1. File 1953/47 | Helen and Daniel inspect the old folder at the reading desk. | 0% 0% |
| 2. A visitor | The suited visitor meets Helen at the reading-room desk. | 50% 0% |
| 3. Confrontation | Helen and Daniel have a tense conversation by the shelves. | 100% 0% |
| 4. The woman in the photograph | Helen sorts letters beside an old portrait. | 0% 100% |
| 5. The real story | Helen and Daniel review the documents side by side. | 50% 100% |
| 6. Forgive | Helen returns the photograph to the folder in evening light. | 100% 100% |

Captions describe the scene's moment. Neither the pictures nor captions should
spell out a comprehension answer: keep writing on letters and folders
unreadable and do not add explanatory labels, names or revealed accusations.

## Fallbacks and loading

Only the story pages request illustration assets. Atlas loading starts when a
scene approaches the viewport, and one in-memory promise shares the download
between all six views. Existing lesson images remain visible while loading
or when the atlas is unavailable. Audio, reading and questions work throughout.

The short English, Italian and Spanish stories use their existing contextual
images with a setting caption. These images illustrate a situation; they do
not claim to establish a persistent cast. A shared dinner image, for example,
is not described as a literal photograph of Rome. Further coherent casts can
be added as explicit manifest entries without changing lesson or story facts.
