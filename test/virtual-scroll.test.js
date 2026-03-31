import { describe, expect, test } from "bun:test"
import { VirtualScroll } from "../src/virtual-scroll"

describe('Virtual scroll', () => {

    test('with no items, no items are rendered', () => {
        const vs = new VirtualScroll({
            items: [],
        })
        vs.setHeight(100, 0)
        expect(vs.idDomMap).toBeEmpty()
    })

    test('with 0px height, no items are rendered', () => {
        const vs = new VirtualScroll({
            createItem: () => ({ style: {} }),
            updateItemContent: () => ({}),
            itemHeight: 10,
            items: [{}],
            itemsContainer: DUMMY_ITEMS_CONTAINER
        })
        vs.setHeight(0, 0)
        expect(vs.idDomMap).toBeEmpty()
    })

    test('with 1px container height, first item is rendered at height 0', () => {
        const item = { id: 'unique-id' }
        const vs = new VirtualScroll({
            createItem: () => ({ style: {} }),
            updateItemContent: () => ({}),
            itemHeight: 10,
            items: [item],
            itemsContainer: DUMMY_ITEMS_CONTAINER,
        })
        vs.setHeight(1, 0)
        expect(vs.idDomMap.get(item.id)).toBeAtHeight(0)
    })

    test('two items render when enough height is added', () => {
        const item1 = { id: 'item-1' }
        const item2 = { id: 'item-2' }
        const vs = new VirtualScroll({
            createItem: () => ({ style: {} }),
            updateItemContent: () => ({}),
            itemHeight: 10,
            items: [item1, item2],
            itemsContainer: DUMMY_ITEMS_CONTAINER,
        })

        vs.setHeight(1, 0)
        expect(vs.idDomMap.get(item1.id)).toBeAtHeight(0)
        expect(vs.idDomMap.get(item2.id)).toBeUndefined() // eh...

        vs.setHeight(11, 0)
        expect(vs.idDomMap.get(item1.id)).toBeAtHeight(0)
        expect(vs.idDomMap.get(item2.id)).toBeAtHeight(10)
    })

    test('offscreen items move into unusedPool', () => {
        const item1 = { id: 'item-1' }
        const item2 = { id: 'item-2' }
        const vs = new VirtualScroll({
            createItem: () => ({ style: {} }),
            updateItemContent: () => ({}),
            itemHeight: 10,
            items: [item1, item2],
            itemsContainer: DUMMY_ITEMS_CONTAINER,
        })

        vs.setHeight(11, 0)
        expect(vs.idDomMap.get(item1.id)).toBeAtHeight(0)
        expect(vs.idDomMap.get(item2.id)).toBeAtHeight(10)

        vs.setHeight(1, 0)
        expect(vs.idDomMap.get(item1.id)).toBeAtHeight(0)
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

