/**
 * VirtualScrollController handles DOM events and coordinates with VirtualScroll.
 * Separates event handling concerns from the core virtual scrolling algorithm.
 */
export class VirtualScrollController {
    constructor({ virtualScroll, container, onScroll, onPoolUpdate }) {
        this.virtualScroll = virtualScroll
        this.container = container
        this.onScroll = onScroll
        this.onPoolUpdate = onPoolUpdate

        this.ticking = false
        this.resizeObserver = null
        this.debouncedResize = null
    }

    /**
     * Attach event listeners to the container.
     */
    start() {
        this.setupScrollListener()
        this.setupResizeObserver()
        // Notify initial pool size
        if (this.onPoolUpdate) {
            this.onPoolUpdate(this.virtualScroll.getPoolSize())
        }
        this.virtualScroll.initialize()
    }

    /**
     * Remove event listeners from the container.
     */
    stop() {
        // Remove scroll listener
        if (this.onScrollHandler) {
            this.container.removeEventListener('scroll', this.onScrollHandler)
            this.onScrollHandler = null
        }

        // Disconnect resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
            this.resizeObserver = null
        }

        // Cancel debounced timeout
        if (this.debouncedResize && typeof this.debouncedResize.cancel === 'function') {
            this.debouncedResize.cancel()
        }
    }

    /**
     * Sets up scroll event listener with RAF throttling.
     */
    setupScrollListener() {
        this.onScrollHandler = () => {
            if (this.onScroll) this.onScroll(this.container.scrollTop)

            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll()
                    this.ticking = false
                })
                this.ticking = true
            }
        }
        this.container.addEventListener('scroll', this.onScrollHandler)
    }

    /**
     * Handles scroll event by calculating visible range and updating VirtualScroll.
     */
    handleScroll() {
        const scrollTop = this.container.scrollTop
        const itemHeight = this.virtualScroll.itemHeight
        const buffer = this.virtualScroll.buffer
        const poolSize = this.virtualScroll.poolSize
        const totalItems = this.virtualScroll.totalItems

        const targetStart = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
        const targetEnd = Math.min(totalItems - 1, targetStart + poolSize - 1)

        this.virtualScroll.updateVisibleRange(targetStart, targetEnd)

        if (this.onPoolUpdate) {
            this.onPoolUpdate(this.virtualScroll.getPoolSize())
        }
    }

    /**
     * Sets up ResizeObserver with debounced handler.
     */
    setupResizeObserver() {
        this.debouncedResize = this.debounce(() => {
            console.log('Resize detected, re-initializing pool...')
            this.virtualScroll.initialize()
            if (this.onPoolUpdate) {
                this.onPoolUpdate(this.virtualScroll.getPoolSize())
            }
        }, 150)

        this.resizeObserver = new ResizeObserver(() => {
            this.debouncedResize()
        })
        this.resizeObserver.observe(this.container)
    }

    /**
     * Debounce utility function.
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     */
    debounce(func, wait) {
        let timeout
        const debounced = (...args) => {
            clearTimeout(timeout)
            timeout = setTimeout(() => func.apply(this, args), wait)
        }
        // Add cancel method for cleanup
        debounced.cancel = () => {
            clearTimeout(timeout)
        }
        return debounced
    }
}
