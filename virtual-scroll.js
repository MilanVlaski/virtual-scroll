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
        this.getKey = config.getKey || (item => item.id)

        // domPool: Map<key, HTMLElement> — currently rendered elements
        this.idDomMap = new Map()
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

        // Process visible range
        const oldDomMap = this.idDomMap
        this.idDomMap = new Map()
        for (let i = start; i < end; i++) {
            const item = this.items[i]
            const key = this.getKey(item)
            const el = oldDomMap.get(key)
            if(!el) continue

            oldDomMap.delete(key)
            this.idDomMap.set(key, el)
        }
        for(const [key, value] of oldDomMap) {
            this.unusedPool.push(value)
        }

        
        for (let i = start; i < end; i++) {
            const item = this.items[i]
            const key = this.getKey(item)

            if (this.idDomMap.has(key)) {
                // Already mounted — just update position
                this.translateElement(this.idDomMap.get(key), i)
            } else {
                // Mount new element
                // Create item is an edge case. It may happen during super fast scrolling
                const el = this.unusedPool.pop() || (console.warn('Pool exhausted!'), this.createItem())
                this.itemsContainer.appendChild(el)
                this.updateItemContent(el, item)
                this.translateElement(el, i)
                el.style.display = ''
                this.idDomMap.set(key, el)
            }
        }

        // Evict off-screen elements
        for (const el in this.unusedPool) {
            el.style.display = 'none'
        }
    }

    translateElement(itemEl, index) {
        itemEl.vsidx = index
        itemEl.style.transform = `translate3d(0, ${index * this.itemHeight + this.offsetTop}px, 0)`
    }
}
