A demonstration of virtual scrolling, using Vanilla JS.

## Implementation Plan

1. 10 items on the page (not necessarily on screen). Their height is known. A CSS variable exists, which we use to know the height.
	1. When we load the page, we explicitly load elements 0 to 12. The elements are at position absolute, top: 0, then we initially translateY them.
	2. Scrolling makes the first element move to the end, so y = position * height, position changes from 0 to 13. We translate Y. We also probably need to requestAnimationFrame.
		1. Elements moving offscreen is caught by a intersection observer, obviously. (Gotta observe moving 0 to 13, but also 13 to 0 when going back)
		2. Also, it's DOM is modified.
		3. Unsure if a queue is necessary.
	3. Grid is used for some reason I can't remember.
	4. Debouncing is used.
2. The point is that the app behaves nicely even when scrolling incredibly fast, faster than the components can render. That means that a queue might be necessary.
