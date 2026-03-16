/**
 * VirtualScroll class encapsulates the logic for high-performance scrolling
 * of large lists by recycling a pool of DOM elements.
 */
export class VirtualScroll {
    constructor(config) {
        this.container = config.container
        this.itemsContainer = config.itemsContainer
        this.itemHeight = config.itemHeight
        this.totalItems = config.totalItems
        this.buffer = config.buffer || 0
        this.createItem = config.createItem
        this.updateItemContent = config.updateItemContent
        this.onPoolUpdate = config.onPoolUpdate

        this.pool = []
        this.poolStart = 0
        this.poolSize = 0

        this.currentStart = 0
    }

    /**
     * Resets the pool and recalculates visible items based on container height.
     */
    setHeight(containerHeight) {
        // This resets, initializes, and scrolls. Not great.
        this.pool.length = 0 
        // Too heavy handed
        this.itemsContainer.innerHTML = ''

        const visibleCount = Math.ceil(containerHeight / this.itemHeight)
        this.poolSize = visibleCount + (this.buffer * 2)

        this.poolStart = 0

        this.currentStart = 0

        this.initializeItems()
        this.handleScroll()
    }

    /**
     * Populates the pool with initial items.
     */
    initializeItems() {
        for (let i = 0; i < this.poolSize; i++) {
            if (this.pool.length > i) continue
            const itemEl = this.createItem()
            this.updateItemContent(itemEl, i, this.itemHeight)
            this.itemsContainer.appendChild(itemEl)
            this.pool.push(itemEl)
        }
    }

    /**
     * Core recycling logic. Determines which items should be visible
     * and moves elements from the pool to their new positions.
     */
    handleScroll() {
        const scrollTop = this.container.scrollTop
        const targetStart = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer)
        const targetEnd = Math.min(this.totalItems - 1, targetStart + this.poolSize - 1)

        if (targetStart === this.currentStart) return

        // If we jumped completely outside the current range
        if (targetStart > this.currentEnd || targetEnd < this.currentStart) {
            for (let i = 0; i < this.poolSize; i++) {
                const el = this.pool[(this.poolStart + i) % this.poolSize]
                this.updateItemContent(el, targetStart + i, this.itemHeight)
            }
            this.currentStart = targetStart
        } else {
            // Sliding window approach
            while (this.currentStart < targetStart) {
                const el = this.pool[this.poolStart]
                this.poolStart = (this.poolStart + 1) % this.poolSize
                this.currentStart++
                this.updateItemContent(el, this.currentEnd, this.itemHeight)
            }

            while (this.currentStart > targetStart) {
                this.poolStart = (this.poolStart - 1 + this.poolSize) % this.poolSize
                const el = this.pool[this.poolStart]
                this.currentStart--
                this.updateItemContent(el, this.currentStart, this.itemHeight)
            }
        }
        // Demonstrates circular buffer in action
        console.log(`Start index: ${this.currentStart}`)
        console.log(`Pool start: ${this.poolStart}`)
    }

    get currentEnd() {
        return this.currentStart + this.poolSize - 1;
    }
}
