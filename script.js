/*
Dependencies: 
HTML: elements with id scroll-container, list-items-container, scroll-y
CSS: --item-height

Initial calculation of pool size based on viewport
TODO might have to make it let. ResizeObserver.
Function that ultimately recalculates POOL_SIZE, rerendering as well.

Future functions: state of elements (read, restore e.g., for the sake of checkbox state). Create element. Update element.
*/

// TODO Pass in these elements to class, or something.
const container = document.getElementById('scroll-container')
const itemsContainer = document.getElementById('list-items-container')
const scrollYDisplay = document.getElementById('scroll-y')

// Except you :P
const elementCountDisplay = document.getElementById('element-count')


const ITEM_HEIGHT = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--item-height'))
const TOTAL_ITEMS = 10000
const BUFFER = 0


let VISIBLE_COUNT
let POOL_SIZE

const pool = []
let currentMin
let currentMax
let poolStart


// Constructor in future class?
function initialize() {
    console.log('redrawn')
    pool.length = 0;

    VISIBLE_COUNT = Math.ceil(container.clientHeight / ITEM_HEIGHT);
    POOL_SIZE = VISIBLE_COUNT + (BUFFER * 2);

    currentMin = 0;
    currentMax = POOL_SIZE - 1;
    poolStart = 0;

    initializeItems()
    updateItemCount()
    handleScroll()
}

const debouncedResize = debounce(() => {
    itemsContainer.innerHTML = '';
    initialize()
}, 150)

const resizeObserver = new ResizeObserver(() => {
    // We COULD check for height changes, because we don't care about width changing
    // But it happens so rarely that it's better not to write the code.
    debouncedResize()
})
resizeObserver.observe(container)

function initializeItems() {
    for (let i = 0; i < POOL_SIZE; i++) {
        const itemEl = createItem()
        updateItemContent(itemEl, i)
        itemsContainer.appendChild(itemEl)
        pool.push(itemEl)
    }
}

// Callback
function createItem() {
    const itemEl = document.createElement('div')
    itemEl.className = 'list-item'
    itemEl.innerHTML = `
        <div class="item-index"></div>
        <div class="item-content">
            <div class="item-title"></div>
            <div class="item-subtitle"></div>
        </div>
    `
    itemEl._indexEl = itemEl.querySelector('.item-index')
    itemEl._titleEl = itemEl.querySelector('.item-title')
    itemEl._subtitleEl = itemEl.querySelector('.item-subtitle')
    return itemEl
}

// Callback
function updateItemContent(el, index) {
    el.dataset.index = index
    el.style.transform = `translateY(${index * ITEM_HEIGHT}px)`

    el._indexEl.textContent = index
    el._titleEl.textContent = `Product #${index + 1}`
    el._subtitleEl.textContent = `High-performance virtual entry ${index * 7}ms offset`
}

// TODO this is a kind of "state", that should be exposed to the outside
function updateItemCount() {
    elementCountDisplay.textContent = pool.length
}
// --- Initial --- //

let ticking = false
container.addEventListener('scroll', () => {
    // Pointless. For updating text on screen
    updateStatsDebounced()

    if (!ticking) {
        window.requestAnimationFrame(() => {
            handleScroll()
            ticking = false
        })
        ticking = true
    }
})

// Pointless.
const updateStatsDebounced = debounce(() => {
    scrollYDisplay.textContent = Math.floor(container.scrollTop)
}, 50)

// Debounce helper for non-critical performance stats
function debounce(func, wait) {
    let timeout
    return function (...args) {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
    }
}

/**
 * Core scrolling logic.
 * Fix #1: Tracks min/max indices in variables to avoid O(n) Math.max.
 * Fix #2: Pure math for recycling to avoid layout thrashing (getBoundingClientRect).
 * Fix #3: Uses a buffer (BUFFER items above/below) for smoothness.
 */
function handleScroll() {
    const scrollTop = container.scrollTop

    // Determine the ideal starting index for the pool (viewport start - buffer)
    const targetStart = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER)
    const targetEnd = Math.min(TOTAL_ITEMS - 1, targetStart + POOL_SIZE - 1)

    // Performance optimization: Skip if we are still within the same range
    if (targetStart === currentMin) return

    // Check if we jumped completely outside the current range
    if (targetStart > currentMax || targetEnd < currentMin) {
        // Full reset
        for (let i = 0; i < POOL_SIZE; i++) {
            const el = pool[(poolStart + i) % POOL_SIZE]
            updateItemContent(el, targetStart + i)
        }
    } else {
        // Sliding window approach: Recycle items from one end to the other
        while (currentMin < targetStart) {
            const el = pool[poolStart]
            poolStart = (poolStart + 1) % POOL_SIZE

            currentMin++
            currentMax++

            updateItemContent(el, currentMax)
        }

        while (currentMin > targetStart) {
            poolStart = (poolStart - 1 + POOL_SIZE) % POOL_SIZE
            const el = pool[poolStart]

            currentMin--
            currentMax--

            updateItemContent(el, currentMin)
        }
    }

    // Update local state for next scroll event
    currentMin = targetStart
    currentMax = targetEnd
}

// Run
initialize()
