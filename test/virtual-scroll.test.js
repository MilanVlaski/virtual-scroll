import { describe, expect, test, beforeEach } from "bun:test"
import { VirtualScroll } from "../src/virtual-scroll"

describe('Virtual scroll', () => {
    let vs
    const items = [{ id: 'item-1' }, { id: 'item-2' }]
    const ITEM_HEIGHT = 10

    beforeEach(() => {
        vs = new VirtualScroll({
            createItem: () => ({ style: {} }),
            updateItemContent: () => ({}),
            itemHeight: ITEM_HEIGHT,
            items,
            itemsContainer: DUMMY_ITEMS_CONTAINER
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

    const DUMMY_ITEMS_CONTAINER = { appendChild: () => { } }

    expect.extend({
        toBeAtPosition(element, expectedPosition) {
            const actualPosition = element.vsidx

            return {
                pass: actualPosition == expectedPosition,
                message: () => `expected id to be ${expectedPosition} but got ${actualPosition}`
            }
        }
    })
})
