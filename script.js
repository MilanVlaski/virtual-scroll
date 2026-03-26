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

// Items array with unique IDs for identity-aware reconciliation
const items = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
    id: i,
    title: `Product #${i + 1}`,
    subtitle: `High-performance virtual entry ${i * 7}ms offset`,
}))

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

function updateItemContent(el, item) {
    el.dataset.index = item.id

    el._indexEl.textContent = item.id
    el._titleEl.textContent = item.title
    el._subtitleEl.textContent = item.subtitle
}

const onScroll = (scrollTop) => {
    scrollYDisplay.textContent = Math.floor(scrollTop)
}

// Instantiate the virtual scroll
const vs = new VirtualScroll({
    itemsContainer,
    itemHeight: ITEM_HEIGHT,
    items,
    keyField: (x => x.id),
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
