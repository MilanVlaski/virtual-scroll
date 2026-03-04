const container = document.getElementById('scroll-container');
const itemsContainer = document.getElementById('list-items-container');
const scrollYDisplay = document.getElementById('scroll-y');
const elementCountDisplay = document.getElementById('element-count');

const ITEM_HEIGHT = 80;
const TOTAL_ITEMS = 10000;
const POOL_SIZE = 13; // Elements 0 to 12

const pool = [];
let firstIndex = 0; // The index of the first item in the pool range

function createItem(index) {
    const el = document.createElement('div');
    el.className = 'list-item';
    el.style.transform = `translateY(${index * ITEM_HEIGHT}px)`;
    updateItemContent(el, index);
    itemsContainer.appendChild(el);
    return { el, index };
}

function updateItemContent(el, index) {
    el.querySelector('.item-index').textContent = index;
    el.querySelector('.item-title').textContent = `Product #${index + 1}`;
    el.querySelector('.item-subtitle').textContent = `High-performance virtual entry ${index * 7}ms offset`;
    el.dataset.index = index;
}

// Initialize pool with 13 elements
for (let i = 0; i < POOL_SIZE; i++) {
    const itemEl = document.createElement('div');
    itemEl.className = 'list-item';
    itemEl.innerHTML = `
        <div class="item-index">${i}</div>
        <div class="item-content">
            <div class="item-title">Product #${i + 1}</div>
            <div class="item-subtitle">High-performance virtual entry ${i * 7}ms offset</div>
        </div>
    `;
    itemEl.style.transform = `translateY(${i * ITEM_HEIGHT}px)`;
    itemEl.dataset.index = i;
    itemsContainer.appendChild(itemEl);
    pool.push(itemEl);
}

elementCountDisplay.textContent = pool.length;

// Intersection Observer Setup
const observerOptions = {
    root: container,
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            recycleElement(entry.target);
        }
    });
}, observerOptions);

pool.forEach(el => observer.observe(el));

function recycleElement(el) {
    const currentIndex = parseInt(el.dataset.index);
    const scrollTop = container.scrollTop;

    // Determine if it exited from top or bottom
    const rect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    let newIndex;

    if (rect.bottom < containerRect.top) {
        // Exited top: move to bottom of the current pool range
        // Find the maximum index currently in the pool
        const maxIndex = Math.max(...pool.map(e => parseInt(e.dataset.index)));
        newIndex = maxIndex + 1;
    } else if (rect.top > containerRect.bottom) {
        // Exited bottom: move to top of the current pool range
        const minIndex = Math.min(...pool.map(e => parseInt(e.dataset.index)));
        newIndex = minIndex - 1;
    } else {
        return; // Still visible or edge case
    }

    if (newIndex >= 0 && newIndex < TOTAL_ITEMS) {
        el.dataset.index = newIndex;
        el.style.transform = `translateY(${newIndex * ITEM_HEIGHT}px)`;
        updateItemContent(el, newIndex);
    }
}

// Jump detection and pool reset
function resetPool() {
    const scrollTop = container.scrollTop;
    const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);

    pool.forEach((el, i) => {
        const newIndex = startIndex + i;
        if (newIndex < TOTAL_ITEMS) {
            el.dataset.index = newIndex;
            el.style.transform = `translateY(${newIndex * ITEM_HEIGHT}px)`;
            updateItemContent(el, newIndex);
        }
    });
}

function checkJump() {
    const scrollTop = container.scrollTop;
    const minVisibleIndex = Math.min(...pool.map(e => parseInt(e.dataset.index)));
    const maxVisibleIndex = Math.max(...pool.map(e => parseInt(e.dataset.index)));

    const viewportStart = Math.floor(scrollTop / ITEM_HEIGHT);
    const viewportEnd = Math.ceil((scrollTop + container.clientHeight) / ITEM_HEIGHT);

    // If the gap between pool and viewport is too large, reset
    if (viewportStart > maxVisibleIndex + 5 || viewportEnd < minVisibleIndex - 5) {
        resetPool();
    }
}

// Debounce helper
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
            checkJump();
            ticking = false;
        });
        ticking = true;
    }
});
