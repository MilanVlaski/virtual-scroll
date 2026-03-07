const container = document.getElementById('scroll-container');
const itemsContainer = document.getElementById('list-items-container');
const scrollYDisplay = document.getElementById('scroll-y');
const elementCountDisplay = document.getElementById('element-count');

const TOTAL_ITEMS = 50000;

function createItem(index) {
    const itemEl = document.createElement('div');
    itemEl.className = 'list-item';
    itemEl.innerHTML = `
        <div class="item-index">${index}</div>
        <div class="item-content">
            <div class="item-title">Product #${index + 1}</div>
            <div class="item-subtitle">Standard DOM entry ${index * 7}ms offset</div>
        </div>
    `;
    return itemEl;
}

// Generate all items at once to demonstrate heavy DOM
console.time('render-time');
const fragment = document.createDocumentFragment();
for (let i = 0; i < TOTAL_ITEMS; i++) {
    fragment.appendChild(createItem(i));
}
itemsContainer.appendChild(fragment);
console.timeEnd('render-time');

elementCountDisplay.textContent = TOTAL_ITEMS;

// Basic scroll tracking for stats
container.addEventListener('scroll', () => {
    scrollYDisplay.textContent = Math.floor(container.scrollTop);
});
