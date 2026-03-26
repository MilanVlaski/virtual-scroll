- [x] Move scrollTop outside, which removes the need for container
- [ ] Items array should be passed in
- [ ] getKey is a function, which takes a HTML element as param, and returns it's key
- [ ] Internally, do a map between the items array, and the keyField (or more broadly, the key function, which takes the item as a param)
- [ ] for updateItemContent(), pass in the item itself, which is fetched from the internal map, by key.
- [ ] 

- [ ] What if items have state? How do we allow "injecting" that state by the client?
- [ ] new config parameter to `virtual-scroll.js` — getKey (default implementation x => x.id) as constructor parameter. For identifying individual elements. Useful for countless things.
- [ ] If filtering or sorting cause a reorder, how do we handle that efficiently, yet without *too much* complexity?
- [ ] 

- [ ] A usecase that pops up is picking a log, and having other logs show time *relative* to that log's time. This needs elements to be stateful.
