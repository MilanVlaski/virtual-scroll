/**
 * VirtualScroll class encapsulates the logic for high-performance scrolling
 * of large lists by recycling a pool of DOM elements using identity-aware reconciliation.
 */
export class VirtualScroll {
    constructor(config) {
        this.itemsContainer = config.itemsContainer
        this.itemHeight = config.itemHeight
        this.items = config.items
        this.buffer = config.buffer || 0
        this.offsetTop = config.offsetTop || 0

        this.createItem = config.createItem
        this.updateItemContent = config.updateItemContent

        // Key function: accepts string (field name) or function
        this.getKey = config.getKey || (item => item['id'])

        // domPool: Map<key, HTMLElement> — currently rendered elements
        this.domPool = new Map()
        // unusedPool: Array<HTMLElement> — recycled elements ready for reuse
        this.unusedPool = []

        this.poolSize = 0
    }

    get totalItems() {
        return this.items?.length || 0
    }

    /**
     * Initialize pool and render visible range.
     */
    setHeight(containerHeight, scrollTop) {
        const newSize = Math.ceil(containerHeight / this.itemHeight) + (this.buffer * 2)

        while (this.unusedPool.length < newSize) {
            this.unusedPool.push(this.createItem())
        }
        while (this.unusedPool.length > newSize) {
            this.unusedPool.pop().remove()
        }

        // Clear domPool - items will be remounted in update()
        this.domPool.forEach(el => {
            this.unusedPool.push(el)
            el.style.display = 'none'
        })
        this.domPool.clear()

        this.poolSize = newSize
        this.update(scrollTop)
    }

    /**
     * Single unified update: evict off-screen, mount on-screen.
     */
    update(scrollTop) {
        const start = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer)
        const end = Math.min(this.totalItems, start + this.poolSize)

        // Track which keys should be visible
        const visibleKeys = new Set()

        // Process visible range
        for (let i = start; i < end; i++) {
            const item = this.items[i]
            const key = this.getKey(item)
            visibleKeys.add(key)

            if (this.domPool.has(key)) {
                // Already mounted — just update position
                this.translateElement(this.domPool.get(key), i)
            } else {
                // Mount new element
                const el = this.unusedPool.pop() || this.createItem()
                this.itemsContainer.appendChild(el)
                this.updateItemContent(el, item)
                this.translateElement(el, i)
                el.style.display = ''
                this.domPool.set(key, el)
            }
        }

        // Evict off-screen elements
        for (const [key, el] of this.domPool) {
            if (!visibleKeys.has(key)) {
                el.style.display = 'none'
                this.unusedPool.push(el)
                this.domPool.delete(key)
            }
        }
    }

    translateElement(itemEl, index) {
        itemEl.style.transform = `translate3d(0, ${index * this.itemHeight + this.offsetTop}px, 0)`
    }
}
