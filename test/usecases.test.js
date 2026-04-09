import { GlobalWindow } from "happy-dom";
import { describe, expect, test, beforeEach, xtest } from "bun:test"
import { VirtualScroll } from "../src/virtual-scroll"
import { DUMMY_ITEMS_CONTAINER } from "./helpers"


const window = new GlobalWindow();
globalThis.window = window;
globalThis.document = window.document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Node = window.Node;
globalThis.CustomEvent = window.CustomEvent;

describe('Virtual scroll', () => {
    let vs
    let itemsContainer

    const TOTAL_ITEMS = 10
    const items = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({ id: `item-${i}` }))
    const ITEM_HEIGHT = 10
    const CONTAINER_HEIGHT = 3 * ITEM_HEIGHT
    const ENOUGH_HEIGHT = 10_0000

    
    // Write updateItemContent that takes the id as param in the dom
    // Assert that updateItemContent is called with such and such params
    
    // Verify state is preserved when scrolling away
    beforeEach(() => {
        itemsContainer = document.createElement('div')
        vs = new VirtualScroll({
            createItem,
            updateItemContent,
            itemHeight: ITEM_HEIGHT,
            items,
            itemsContainer,
        })
    })

    xtest('proper reusability of elements', () => {
        vs.setHeight(items.length * ITEM_HEIGHT, 0)

        const evenItems = removeOdd(items)
        const oddItems = removeEven(items)

        vs.items = evenItems

        // we expect all the items to be rendered as DOM elements
        // we can even store their references?
        // once we remove the odd ones, we expect the even ones to
        // stay updates 0 times

        // and when we add an odd element
        // and we expect the even n
        vs.setHeight(items.length * ITEM_HEIGHT, 0)

        expect(getChildrenHtml(vs)).toEqual(['id:1', 'id:2', 'id:3'])
        expect(vs.idDomMap.get(items[0].id)).toBeUpdated(3)
    })

    const removeOdd = arr => arr.splice((_, i) => i % 2 === 0)
    const removeEven = arr => arr.filter((_, i) => i % 2 !== 0)

    // TODO helper function that takes innerHTML of each element,
    // so we can inspect it
    // Give sorted elements


    // helpers
    const scrollToPosition = (position) => {
        vs.setHeight(CONTAINER_HEIGHT, position * ITEM_HEIGHT)
        console.log(`Container at ${position}`,JSON.stringify(itemsContainer.innerHTML, null, 2))

    }


    const createItem = () => {
        const $el = document.createElement('div');
        $el.textContent = ''
        $el.updateCount = 0
        return $el
    }

    const updateItemContent = (element, item) => {
        element.updateCount++
        element.textContent = `id:${item.id}`
    }
})
