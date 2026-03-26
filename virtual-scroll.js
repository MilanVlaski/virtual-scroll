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
        return this.items ? this.items.length : 0
    }

    /**
     * Resets the pool and recalculates visible items based on container height.
     */
    setHeight(containerHeight, scrollTop) {
        const newSize = Math.ceil(containerHeight / this.itemHeight) + (this.buffer * 2)

        // 1. Grow unusedPool if needed (elements will be created on demand)
        while (this.unusedPool.length < newSize) {
            const el = this.createItem()
            el.style.display = 'none'
            this.unusedPool.push(el)
        }

        // 2. Shrink unusedPool if too large
        while (this.unusedPool.length > newSize) {
            this.unusedPool.pop().remove()
        }

        // 3. Clear domPool — will be repopulated on next scroll
        this.domPool.forEach(el => {
            el.style.display = 'none'
            this.unusedPool.push(el)
        })
        this.domPool.clear()

        // 4. Update pool size
        this.poolSize = newSize

        // 5. Immediate render
        const start = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer)
        this.renderRange(start, start + this.poolSize)
    }

    /**
     * Render a range of items, mounting them to the DOM.
     */
    renderRange(start, end) {
        const clampedEnd = Math.min(this.totalItems, end)

        for (let i = start; i < clampedEnd; i++) {
            const item = this.items[i]
            const key = this.getKey(item)

            // Check if already in domPool
            if (this.domPool.has(key)) {
                const el = this.domPool.get(key)
                this.translateElement(el, i)
                el.style.display = ''
                continue
            }

            // Get element from unusedPool or create new
            const el = this.unusedPool.pop() || this.createItem()
            this.itemsContainer.appendChild(el)

            // Update content with full item object
            this.updateItemContent(el, item)
            this.translateElement(el, i)
            el.style.display = ''

            this.domPool.set(key, el)
        }
    }

    /**
     * Core reconciliation logic: diff current visible items vs new visible range.
     */
    handleScroll(scrollTop) {
        const targetStart = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer)
        const targetEnd = Math.min(this.totalItems, targetStart + this.poolSize)

        // Build Set of keys that should be visible
        const visibleKeys = new Set()
        for (let i = targetStart; i < targetEnd; i++) {
            visibleKeys.add(this.getKey(this.items[i]))
        }

        // Evict off-screen elements
        for (const [key, el] of this.domPool) {
            if (!visibleKeys.has(key)) {
                el.style.display = 'none'
                this.unusedPool.push(el)
                this.domPool.delete(key)
            }
        }

        // Mount on-screen elements
        for (let i = targetStart; i < targetEnd; i++) {
            const item = this.items[i]
            const key = this.getKey(item)

            if (this.domPool.has(key)) {
                // Already mounted — just update position
                const el = this.domPool.get(key)
                this.translateElement(el, i)
            } else {
                // New element needed
                const el = this.unusedPool.pop() || this.createItem()
                this.itemsContainer.appendChild(el)

                this.updateItemContent(el, item)
                this.translateElement(el, i)
                el.style.display = ''

                this.domPool.set(key, el)
            }
        }
    }

    translateElement(itemEl, index) {
        itemEl.style.transform = `translateY(${index * this.itemHeight + this.offsetTop}px)`
    }
}