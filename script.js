const container = document.getElementById('scroll-container');
const itemsContainer = document.getElementById('list-items-container');
const scrollYDisplay = document.getElementById('scroll-y');
const elementCountDisplay = document.getElementById('element-count');

const ITEM_HEIGHT = 80;
const TOTAL_ITEMS = 10000;
const BUFFER = 5;

// Initial calculation of pool size based on viewport
const VISIBLE_COUNT = Math.ceil(container.clientHeight / ITEM_HEIGHT);
const POOL_SIZE = VISIBLE_COUNT + (BUFFER * 2);

const pool = [];
let currentMin = 0;
let currentMax = POOL_SIZE - 1;

/**
 * Updates an item's content and position.
 * Fix #4: Uses cached DOM references instead of querySelector.
 */
function updateItemContent(el, index) {
    el.dataset.index = index;
    el.style.transform = `translateY(${index * ITEM_HEIGHT}px)`;

    el._indexEl.textContent = index;
    el._titleEl.textContent = `Product #${index + 1}`;
    el._subtitleEl.textContent = `High-performance virtual entry ${index * 7}ms offset`;
}

// Initialize pool (Fix #4: Cache child references on the element)
for (let i = 0; i < POOL_SIZE; i++) {
    const itemEl = document.createElement('div');
    itemEl.className = 'list-item';
    itemEl.innerHTML = `
        <div class="item-index"></div>
        <div class="item-content">
            <div class="item-title"></div>
            <div class="item-subtitle"></div>
        </div>
    `;

    // Store references to avoid expensive DOM lookups later
    itemEl._indexEl = itemEl.querySelector('.item-index');
    itemEl._titleEl = itemEl.querySelector('.item-title');
    itemEl._subtitleEl = itemEl.querySelector('.item-subtitle');

    updateItemContent(itemEl, i);
    itemsContainer.appendChild(itemEl);
    pool.push(itemEl);
}

elementCountDisplay.textContent = pool.length;

/**
 * Core scrolling logic.
 * Fix #1: Tracks min/max indices in variables to avoid O(n) Math.max.
 * Fix #2: Pure math for recycling to avoid layout thrashing (getBoundingClientRect).
 * Fix #3: Uses a buffer (BUFFER items above/below) for smoothness.
 */
function handleScroll() {
    const scrollTop = container.scrollTop;

    // Determine the ideal starting index for the pool (viewport start - buffer)
    const targetStart = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER);
    const targetEnd = Math.min(TOTAL_ITEMS - 1, targetStart + POOL_SIZE - 1);

    // Performance optimization: Skip if we are still within the same range
    if (targetStart === currentMin) return;

    // Check if we jumped completely outside the current range
    if (targetStart > currentMax || targetEnd < currentMin) {
        // Full reset
        for (let i = 0; i < POOL_SIZE; i++) {
            updateItemContent(pool[i], targetStart + i);
        }
    } else {
        // Sliding window approach: Recycle items from one end to the other
        while (currentMin < targetStart) {
            // Recycled items move from top to bottom
            const el = pool.shift();
            pool.push(el);
            currentMin++;
            currentMax++;
            updateItemContent(el, currentMax);
        }
        while (currentMin > targetStart) {
            // Recycled items move from bottom to top
            const el = pool.pop();
            pool.unshift(el);
            currentMin--;
            currentMax--;
            updateItemContent(el, currentMin);
        }
    }

    // Update local state for next scroll event
    currentMin = targetStart;
    currentMax = targetEnd;
}

// Debounce helper for non-critical performance stats
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const updateStatsDebounced = debounce(() => {
    scrollYDisplay.textContent = Math.floor(container.scrollTop);
}, 50);

let ticking = false;
container.addEventListener('scroll', () => {
    updateStatsDebounced();

    if (!ticking) {
        window.requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
        });
        ticking = true;
    }
});
