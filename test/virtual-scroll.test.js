import { describe, expect, test, beforeEach } from "bun:test"
import { VirtualScroll } from "../src/virtual-scroll"

describe('Virtual scroll', () => {
    let vs
    const items = [{ id: 'item-1' }, { id: 'item-2' }]
    const ITEM_HEIGHT = 10
    const ENOUGH_HEIGHT = 10_0000

    beforeEach(() => {
        vs = new VirtualScroll({
            createItem: () => ({ style: {} }),
            updateItemContent: () => ({}),
            itemHeight: ITEM_HEIGHT,
            items,
            itemsContainer: DUMMY_ITEMS_CONTAINER,
        })
    })

    test('with no items, no items are rendered', () => {
        const vs = new VirtualScroll({
            items: [],
        })
        vs.setHeight(100, 0)
        expect(vs.idDomMap).toBeEmpty()
    })

    test('with 0px height, no items are rendered', () => {
        vs.setHeight(0, 0)
        expect(vs.idDomMap).toBeEmpty()
    })

    test('with 1px container height, first item is rendered at height 0', () => {
        vs.setHeight(1, 0)
        expect(vs.idDomMap.get(items[0].id)).toBeAtPosition(0)
    })

    test('two items render when there is enough height for two items', () => {
        vs.setHeight(1, 0)
        expect(vs.idDomMap.get(items[0].id)).toBeAtPosition(0)
        expect(vs.idDomMap.get(items[1].id)).toBeUndefined() // eh...

        vs.setHeight(ITEM_HEIGHT + 1, 0)
        const index = 0
        expect(vs.idDomMap.get(items[0].id)).toBeAtPosition(0)
        expect(vs.idDomMap.get(items[1].id)).toBeAtPosition(1)
    })

    test('when height shrinks from two items to one, the second item moves into unusedPool', () => {
        vs.setHeight(ITEM_HEIGHT + 1, 0)
        expect(vs.idDomMap.get(items[0].id)).toBeAtPosition(0)
        const secondElement = vs.idDomMap.get(items[1].id)
        expect(secondElement).toBeAtPosition(1)

        vs.setHeight(1, 0)
        expect(vs.idDomMap.get(items[0].id)).toBeAtPosition(0)
        expect(vs.unusedPool[0]).toBe(secondElement)
    })

    test('when scroll from two items to one, the first item moves into unusedPool', () => {
        vs.setHeight(ENOUGH_HEIGHT, 0)
        
        const secondElement = vs.idDomMap.get(items[1].id)
        const firstElement = vs.idDomMap.get(items[0].id)
        expect(vs.idDomMap.get(items[0].id)).toBeAtPosition(0)
        expect(secondElement).toBeAtPosition(1)

        vs.setHeight(ENOUGH_HEIGHT, ITEM_HEIGHT)
        expect(vs.idDomMap.get(items[1].id)).toBeAtPosition(1)
        expect(vs.unusedPool[0]).toBe(firstElement)
    })

    test('with buffer 1, shrinking height from two visible items to one still keeps both rendered', () => {
        vs.buffer = 1
        // Height for 2 items
        vs.setHeight(ITEM_HEIGHT * 2, 0)
        expect(vs.idDomMap.get(items[0].id)).toBeAtPosition(0)
        expect(vs.idDomMap.get(items[1].id)).toBeAtPosition(1)

        // Shrink height to only fit 1 item
        vs.setHeight(ITEM_HEIGHT, 0)

        // Both should still exist because item[1] is now in the bottom buffer
        expect(vs.idDomMap.get(items[0].id)).toBeAtPosition(0)
        expect(vs.idDomMap.get(items[1].id)).toBeAtPosition(1)
        expect(vs.unusedPool).toBeEmpty()
    })

    test('with buffer 1, scrolling past the first item keeps it rendered until it exits the buffer', () => {
        vs.buffer = 1
        vs.setHeight(ENOUGH_HEIGHT, 0)

        const firstElement = vs.idDomMap.get(items[0].id)
        const secondElement = vs.idDomMap.get(items[1].id)

        expect(firstElement).toBeAtPosition(0)
        expect(secondElement).toBeAtPosition(1) // Rendered via buffer

        // Scroll so item[0] is completely off-screen
        vs.setHeight(ENOUGH_HEIGHT, ITEM_HEIGHT)

        // item[0] should still be in DOM because of buffer (top buffer)
        expect(vs.idDomMap.get(items[0].id)).toBeAtPosition(0)
        expect(vs.idDomMap.get(items[1].id)).toBeAtPosition(1)
        expect(vs.unusedPool).toBeEmpty()

        // Scroll further so item[0] is beyond the buffer range
        vs.setHeight(ENOUGH_HEIGHT, ITEM_HEIGHT * 2)

        // Now item[0] should finally be pooled
        expect(vs.idDomMap.get(items[0].id)).toBeUndefined()
        expect(vs.unusedPool[0]).toBe(firstElement)
    })

    const DUMMY_ITEMS_CONTAINER = { appendChild: () => { } }

    expect.extend({
        // Vsidx trenutno racuna "virtuelnu" poziciju, koja odgovara transform poziciji.
        // Umjesto toga, da li nam treba neki vsidx da mjeri "vizuelno" sta je na ekranu?
        // Kontam da ne, jer je to u principu samo dom.
        // Ali sad to zavisi i od bafera.
        toBeAtPosition(element, expectedPosition) {
            const actualPosition = element.vsidx

            return {
                pass: actualPosition == expectedPosition,
                message: () => `expected id to be ${expectedPosition} but got ${actualPosition}`
            }
        }
    })
})
