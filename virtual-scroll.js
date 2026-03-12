/**
 * VirtualScroll class encapsulates the logic for high-performance scrolling
 * of large lists by recycling a pool of DOM elements.
 */
export class VirtualScroll {
    constructor(config) {
        this.container = config.container
        this.itemsContainer = config.itemsContainer
        this._itemHeight = config.itemHeight
        this._totalItems = config.totalItems
        this._buffer = config.buffer || 0
        this.createItem = config.createItem
        this.updateItemContent = config.updateItemContent
        this.onScroll = config.onScroll
        this.onPoolUpdate = config.onPoolUpdate

        this.pool = []
        this.currentMin = 0
        this.currentMax = 0
        this.poolStart = 0
        this.visibleCount = 0
        this._poolSize = 0
    }

    /**
     * Resets the pool and recalculates visible items based on container height.
     */
    initialize() {
        this.pool.length = 0
        this.itemsContainer.innerHTML = ''

        this.visibleCount = Math.ceil(this.container.clientHeight / this._itemHeight)
        this._poolSize = this.visibleCount + (this._buffer * 2)

        this.currentMin = 0
        this.currentMax = this._poolSize - 1
        this.poolStart = 0

        this.initializeItems()
        // Set initial visible range to show items at the start
        this.updateVisibleRange(0, this._poolSize - 1)
    }

    /**
     * Populates the pool with initial items.
     */
    initializeItems() {
        for (let i = 0; i < this._poolSize; i++) {
            const itemEl = this.createItem()
            this.updateItemContent(itemEl, i, this._itemHeight)
            this.itemsContainer.appendChild(itemEl)
            this.pool.push(itemEl)
        }
    }

    /**
     * Core recycling logic. Determines which items should be visible
     * and moves elements from the pool to their new positions.
     * @param {number} targetStart - The first visible item index
     * @param {number} targetEnd - The last visible item index
     */
    updateVisibleRange(targetStart, targetEnd) {
        if (targetStart === this.currentMin) return

        // If we jumped completely outside the current range
        if (targetStart > this.currentMax || targetEnd < this.currentMin) {
            for (let i = 0; i < this._poolSize; i++) {
                const el = this.pool[(this.poolStart + i) % this._poolSize]
                this.updateItemContent(el, targetStart + i, this._itemHeight)
            }
        } else {
            // Sliding window approach
            while (this.currentMin < targetStart) {
                const el = this.pool[this.poolStart]
                this.poolStart = (this.poolStart + 1) % this._poolSize
                this.currentMin++
                this.currentMax++
                this.updateItemContent(el, this.currentMax, this._itemHeight)
            }

            while (this.currentMin > targetStart) {
                this.poolStart = (this.poolStart - 1 + this._poolSize) % this._poolSize
                const el = this.pool[this.poolStart]
                this.currentMin--
                this.currentMax--
                this.updateItemContent(el, this.currentMin, this._itemHeight)
            }
        }

        this.currentMin = targetStart
        this.currentMax = targetEnd
    }

    getPoolSize() {
        return this.pool.length
    }

    get itemHeight() {
        return this._itemHeight
    }

    get buffer() {
        return this._buffer
    }

    get poolSize() {
        return this._poolSize
    }

    get totalItems() {
        return this._totalItems
    }
}
