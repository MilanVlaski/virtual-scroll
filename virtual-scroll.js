/**
 * VirtualScroll class encapsulates the logic for high-performance scrolling
 * of large lists by recycling a pool of DOM elements.
 */
export class VirtualScroll {
    constructor(config) {
        this.container = config.container // delete

        this.itemsContainer = config.itemsContainer
        this.itemHeight = config.itemHeight
        this.totalItems = config.totalItems
        this.buffer = config.buffer || 0

        this.createItem = config.createItem
        this.updateItemContent = config.updateItemContent

        this.pool = []
        this.poolStart = 0
        this.poolSize = 0

        this.currentStart = 0

        this.offsetTop = 150
    }

    /**
     * Resets the pool and recalculates visible items based on container height.
     */
    setHeight(containerHeight) {
        const newSize = Math.ceil(containerHeight / this.itemHeight) + (this.buffer * 2)

        // 1. Differential DOM updates (no innerHTML = '')
        while (this.pool.length < newSize) {
            const el = this.createItem()
            this.itemsContainer.appendChild(el)
            this.pool.push(el)
        }
        while (this.pool.length > newSize) {
            this.pool.pop().remove()
        }

        // 2. Refresh state
        this.poolSize = newSize
        this.poolStart = 0

        // 3. Immediate sync
        // Calculate the starting index based on current scroll position
        const start = Math.max(0, Math.floor(this.container.scrollTop / this.itemHeight) - this.buffer)

        this.pool.forEach((el, i) => {
            this.updateItemContent(el, start + i)
            this.translateElement(el, start + i)
        })

        this.currentStart = start
    }

    /**
     * Populates the pool with initial items.
     */
    initializeItems() {
        for (let i = 0; i < this.poolSize; i++) {
            if (this.pool.length > i) continue
            const itemEl = this.createItem()
            this.updateItemContent(itemEl, i)
            this.translateElement(itemEl, i)
            this.itemsContainer.appendChild(itemEl)
            this.pool.push(itemEl)
        }
    }

    /**
     * Core recycling logic. Determines which items should be visible
     * and moves elements from the pool to their new positions.
     */
    handleScroll() {
        // pass scrollTop here
        const targetStart = Math.max(0, Math.floor(this.container.scrollTop / this.itemHeight) - this.buffer)
        const targetEnd = Math.min(this.totalItems - 1, targetStart + this.poolSize - 1)

        if (targetStart === this.currentStart) return

        // If we jumped completely outside the current range
        if (targetStart > this.currentEnd || targetEnd < this.currentStart) {
            for (let i = 0; i < this.poolSize; i++) {
                const el = this.pool[(this.poolStart + i) % this.poolSize]
                this.updateItemContent(el, targetStart + i)
                this.translateElement(el, targetStart + i)
            }
            this.currentStart = targetStart
        } else {
            // Sliding window approach
            while (this.currentStart < targetStart) {
                const el = this.pool[this.poolStart]
                this.poolStart = (this.poolStart + 1) % this.poolSize
                this.currentStart++
                this.updateItemContent(el, this.currentEnd)
                this.translateElement(el, this.currentEnd)
            }

            while (this.currentStart > targetStart) {
                this.poolStart = (this.poolStart - 1 + this.poolSize) % this.poolSize
                const el = this.pool[this.poolStart]
                this.currentStart--
                this.updateItemContent(el, this.currentStart)
                this.translateElement(el, this.currentStart)
            }
        }
        // Demonstrates circular buffer in action
        console.log(`Start index: ${this.currentStart}`)
        console.log(`Pool start: ${this.poolStart}`)
    }

    translateElement(itemEl, index) {
        itemEl.style.transform = `translateY(${index * this.itemHeight + this.offsetTop}px)`
    }

    get currentEnd() {
        return this.currentStart + this.poolSize - 1;
    }
}
