import {describe, expect, test} from "bun:test"
import { VirtualScroll } from "../src/virtual-scroll"

describe('Virtual scroll', () => {
    test('with no elements, renders nothing', () => {
        const vs = new VirtualScroll({
            items: [],
        })
        vs.setHeight(100, 0)
        expect(vs.idDomMap).toBeEmpty()
    })

})
