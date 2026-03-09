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
        this.onScroll = config.onScroll
        this.onPoolUpdate = config.onPoolUpdate

        this.pool = []
        this.currentMin = 0
        this.currentMax = 0
        this.poolStart = 0
        this.visibleCount = 0
        this.poolSize = 0

        this.ticking = false

        this.setupEventListeners()
    }

    /**
     * Resets the pool and recalculates visible items based on container height.
     */
    initialize() {
        this.pool.length = 0
        this.itemsContainer.innerHTML = ''

        this.visibleCount = Math.ceil(this.container.clientHeight / this.itemHeight)
        this.poolSize = this.visibleCount + (this.buffer * 2)

        this.currentMin = 0
        this.currentMax = this.poolSize - 1
        this.poolStart = 0

        this.initializeItems()
        if (this.onPoolUpdate) this.onPoolUpdate(this.pool.length)
        this.handleScroll()
    }

    /**
     * Populates the pool with initial items.
     */
    initializeItems() {
        for (let i = 0; i < this.poolSize; i++) {
            const itemEl = this.createItem()
            this.updateItemContent(itemEl, i, this.itemHeight)
            this.itemsContainer.appendChild(itemEl)
            this.pool.push(itemEl)
        }
    }

    /**
     * Sets up scroll and resize listeners.
     */
    setupEventListeners() {
        this.container.addEventListener('scroll', () => {
            if (this.onScroll) this.onScroll(this.container.scrollTop)

            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll()
                    this.ticking = false
                })
                this.ticking = true
            }
        })

        const debouncedResize = this.debounce(() => {
            console.log('Resize detected, re-initializing pool...')
            this.initialize()
        }, 150)

        this.resizeObserver = new ResizeObserver(() => {
            debouncedResize()
        })
        this.resizeObserver.observe(this.container)
    }

    /**
     * Core recycling logic. Determines which items should be visible
     * and moves elements from the pool to their new positions.
     */
    handleScroll() {
        const scrollTop = this.container.scrollTop
        const targetStart = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer)
        const targetEnd = Math.min(this.totalItems - 1, targetStart + this.poolSize - 1)

        if (targetStart === this.currentMin) return

        // If we jumped completely outside the current range
        if (targetStart > this.currentMax || targetEnd < this.currentMin) {
            for (let i = 0; i < this.poolSize; i++) {
                const el = this.pool[(this.poolStart + i) % this.poolSize]
                this.updateItemContent(el, targetStart + i, this.itemHeight)
            }
        } else {
            // Sliding window approach
            while (this.currentMin < targetStart) {
                const el = this.pool[this.poolStart]
                this.poolStart = (this.poolStart + 1) % this.poolSize
                this.currentMin++
                this.currentMax++
                this.updateItemContent(el, this.currentMax, this.itemHeight)
            }

            while (this.currentMin > targetStart) {
                this.poolStart = (this.poolStart - 1 + this.poolSize) % this.poolSize
                const el = this.pool[this.poolStart]
                this.currentMin--
                this.currentMax--
                this.updateItemContent(el, this.currentMin, this.itemHeight)
            }
        }

        this.currentMin = targetStart
        this.currentMax = targetEnd
    }

    debounce(func, wait) {
        let timeout
        return (...args) => {
            clearTimeout(timeout)
            timeout = setTimeout(() => func.apply(this, args), wait)
        }
    }
}
