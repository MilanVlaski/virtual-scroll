export const DUMMY_ITEMS_CONTAINER = { appendChild: () => { } }

expect.extend({
    // better to test translation
    toBeAtPosition(element, expectedPosition) {
        const actualPosition = element.vsidx

        return {
            pass: actualPosition == expectedPosition,
            message: () => `expected id to be ${expectedPosition} but got ${actualPosition}`
        }
    }
})

// updated X times
expect.extend({
    wasUpdated(numberOfUpdates, expected) {
        return {
            pass: expected == numberOfUpdates,
            message: () => `expected element to have been updated ${expected} times but got ${numberOfUpdates}`
        }
    }
})

// innerHTML 
