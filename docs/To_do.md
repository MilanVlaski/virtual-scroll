- [x] Move scrollTop outside, which removes the need for container
- [ ] What if items have state? How do we allow "injecting" that state by the client?
- [ ] new config parameter to `virtual-scroll.js` — getKey (default implementation x => x.id) as constructor parameter. For identifying individual elements. Useful for countless things.
- [ ] If filtering or sorting cause a reorder, how do we handle that efficiently, yet without *too much* complexity?
- [ ] 

- [ ] A usecase that pops up is picking a log, and having other logs show time *relative* to that log's time. This needs elements to be stateful.
