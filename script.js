import { ScrollController } from './scroll-controller.js';
import { VirtualScroll } from './virtual-scroll.js';

// --- Usage --- //

const container = document.getElementById('scroll-container')
const itemsContainer = document.getElementById('list-items-container')
const scrollYDisplay = document.getElementById('scroll-y')
const elementCountDisplay = document.getElementById('element-count')

const ITEM_HEIGHT = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--item-height'))
const TOTAL_ITEMS = 10000

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

function updateItemContent(el, index) {
    el.dataset.index = index

    el._indexEl.textContent = index
    el._titleEl.textContent = `Product #${index + 1}`
    el._subtitleEl.textContent = `High-performance virtual entry ${index * 7}ms offset`
}

const onScroll = (scrollTop) => {
    scrollYDisplay.textContent = Math.floor(scrollTop)
}

// Instantiate the virtual scroll
const vs = new VirtualScroll({
    container,
    itemsContainer,
    itemHeight: ITEM_HEIGHT,
    totalItems: TOTAL_ITEMS,
    buffer: 0,
    createItem,
    updateItemContent,
})

const controller = new ScrollController(
    { virtualScroll: vs, container, onScroll }
)

controller.start()


// Allows us to use vs.setHeight(100) in the console!
window.vs = vs
