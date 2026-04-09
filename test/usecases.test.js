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
    const items = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({ id: `${i}` }))
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

    test('proper reusability of elements', () => {
        vs.setHeight(items.length * ITEM_HEIGHT, 0)

        const evens = removeOdd(items)
        vs.items = evens

        vs.setHeight(items.length * ITEM_HEIGHT, 0)

        expect(getVisibleElementsTextContent())
            .toEqual(['id:0', 'id:2', 'id:4', 'id:6', 'id:8',])

        // we can even store their references?
        // once we remove the odd ones, we expect the even ones to
        // stay updates 0 times

        // and when we add an odd element
        // and we expect the even n
        // vs.setHeight(items.length * ITEM_HEIGHT, 0)

        // expect(vs.idDomMap.get(items[0].id)).toBeUpdated(3)
    })

    const removeOdd = arr => arr.filter((_, i) => i % 2 === 0)

    // TODO helper function that takes innerHTML of each element,
    // so we can inspect it
    // Give sorted elements
    function getVisibleElementsTextContent() {
        return Array.from(vs.idDomMap.values())
            .sort((a, b) => a.id - b.id)
            .map(child => child.textContent)
    }

    // helpers
    const scrollToPosition = (position) => {
        vs.setHeight(CONTAINER_HEIGHT, position * ITEM_HEIGHT)
        console.log(`Container at ${position}`, JSON.stringify(itemsContainer.innerHTML, null, 2))
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
