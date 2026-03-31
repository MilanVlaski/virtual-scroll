- [x] Move scrollTop outside, which removes the need for container
- [x] Items array should be passed in
- [x] getKey is a function, which takes a HTML element as param, and returns it's key
- [x] Internally, do a map between the items array, and the keyField (or more broadly, the key function, which takes the item as a param)
- [x] for updateItemContent(), pass in the item itself, which is fetched from the internal map, by key.
- [ ] If filtering or sorting cause a reorder, how do we handle that efficiently, yet without *too much* complexity?
- [ ] A usecase that pops up is picking a log, and having other logs show time *relative* to that log's time. This needs elements to be stateful.
- [ ] Call it domMap
- [ ] Tests
    - [ ] Check that elements are translated as expected
    - [ ] height, 10 elements, how many are visible?
    - [ ] Check that programmatically scrolling works


# Tests
- 0 items with whatever height, 0 are rendered
- 1 items with 0 height, none are rendered
- 1 items with 1px height, one or none is rendered?
- 1 items, where height equal to scrollTop, renders one item
- Render one item on screen. update scrollTop so there's an extra item.
- Render one item. Update scroll top so that there are 0 items.
- Modify the items array
  - Remove an item (Remove a visible item from the items array. Verify its element is moved to unusedPool and hidden (display: none).)
  - Reverse (2 items)
  - Add an element to the array
- State remains when elements move offscreen
- Buffer should force extra elements into unused pool or so
  - 3. Buffer Boundaries
You have a buffer (e.g., 2). You should test the math at the very top and very bottom of the list.

Top: When scrollTop is 0, the start should be 0 (not a negative number from the buffer).

Bottom: When at the end of the list, end should strictly be totalItems, and no "empty" elements should be left visible.
- Off screen elements should move to unusedPool
- Initialize such that there is one item off-screen. When we update to make the item visible, assert that it is no longer in unused pool, but has moved to the last position.
- Calling update() twice with the same scrollTop should result in zero DOM operations or Map changes.
- jump scroll
- Replace all items

rendered, meaning, it's in the idDomMap
Check vsidx of items is as expected
