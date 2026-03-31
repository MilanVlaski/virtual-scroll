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
        expect(vs.idDomMap.get(items[0].id)).toBeAtHeight(0)
    })

    test('two items render when enough height is added', () => {
        vs.setHeight(1, 0)
        expect(vs.idDomMap.get(items[0].id)).toBeAtHeight(0)
        expect(vs.idDomMap.get(items[1].id)).toBeUndefined() // eh...

        vs.setHeight(ITEM_HEIGHT + 1, 0)
        expect(vs.idDomMap.get(items[0].id)).toBeAtHeight(0)
        expect(vs.idDomMap.get(items[1].id)).toBeAtHeight(10)
    })

    test('offscreen items move into unusedPool', () => {
        vs.setHeight(ITEM_HEIGHT + 1, 0)
        expect(vs.idDomMap.get(items[0].id)).toBeAtHeight(0)
        expect(vs.idDomMap.get(items[1].id)).toBeAtHeight(10)

        vs.setHeight(1, 0)
        expect(vs.idDomMap.get(items[0].id)).toBeAtHeight(0)
        expect(vs.unusedPool[0]).toBeAtHeight(10)
    })

    const DUMMY_ITEMS_CONTAINER = { appendChild: () => { } }

    // Either this, or we replace usages with toHavePosition, where we check
    // for the vsidx variable. Or we use both.
    expect.extend({
        toBeAtHeight(element, expectedHeight) {
            // x, y, z. [1] because y is second.
            const actualHeight = element.style.transform.split(',')[1].trim().replace('px', '')

            const pass = actualHeight == expectedHeight

            return {
                pass,
                message: () => `expected translateY to be ${expectedHeight} but got ${actualHeight}`
            }
        }
    })
})

