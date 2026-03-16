export class ScrollController {

    constructor({ virtualScroll, container, onScroll }) {

        this.virtualScroll = virtualScroll
        this.container = container
        this.onScroll = onScroll

        this.ticking = false

        this.container.addEventListener('scroll', () => {
            if (this.onScroll) this.onScroll(this.container.scrollTop)

            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    this.virtualScroll.handleScroll()
                    this.ticking = false
                })
                this.ticking = true
            }
        })

        const debouncedResize = debounce(() => {
            this.virtualScroll.setHeight(this.container.clientHeight)
        }, 150)

        this.resizeObserver = new ResizeObserver(() => {
            debouncedResize()
        })
        this.resizeObserver.observe(this.container)
    }

    start() {
        this.virtualScroll.setHeight(this.container.clientHeight)
    }
}

function debounce(func, wait) {
    let timeout
    return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
    }
}
