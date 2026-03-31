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
            createItem: () => ({ style: {}}),
            updateItemContent: () => ({ }),
            itemHeight: 10,
            items: [{}],
            itemsContainer: DUMMY_ITEMS_CONTAINER
        })
        vs.setHeight(0, 0)
        expect(vs.idDomMap).toBeEmpty()
    })

    test('with 1px container height, first item is rendered at height 0', () => {
        const id = 'unique-id'
        const item = {id}
        const vs = new VirtualScroll({
            createItem: () => ({ style: {}}),
            updateItemContent: () => ({ }),
            itemHeight: 10,
            items: [item],
            itemsContainer: DUMMY_ITEMS_CONTAINER,
        })
        vs.setHeight(1, 0)
        expect(vs.idDomMap.get(id)).toBeAtHeight(0)
    })

    const DUMMY_ITEMS_CONTAINER = { appendChild: () => { } }

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

