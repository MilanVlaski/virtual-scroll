- [x] Move scrollTop outside, which removes the need for container
- [x] Items array should be passed in
- [x] getKey is a function, which takes a HTML element as param, and returns it's key
- [x] Internally, do a map between the items array, and the keyField (or more broadly, the key function, which takes the item as a param)
- [x] for updateItemContent(), pass in the item itself, which is fetched from the internal map, by key.

- check things on screen
- check data array, items with same id, reuse elements.
  - 