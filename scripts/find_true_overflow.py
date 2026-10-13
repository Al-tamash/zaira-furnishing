from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 375, "height": 812})
    page = context.new_page()
    page.goto("http://localhost:3000/", wait_until="networkidle")
    
    true_overflowers = page.evaluate("""() => {
        const docWidth = document.documentElement.clientWidth;
        const results = [];
        const all = document.querySelectorAll('*');
        
        function hasScrollAncestor(el) {
            let p = el.parentElement;
            while (p && p !== document.body && p !== document.documentElement) {
                const style = window.getComputedStyle(p);
                if (style.overflowX === 'auto' || style.overflowX === 'scroll' || style.overflowX === 'hidden') {
                    // if it clips or scrolls, child right doesn't expand document unless the container itself overflows
                    if (p.getBoundingClientRect().right <= docWidth) {
                        return true;
                    }
                }
                p = p.parentElement;
            }
            return false;
        }

        for (let el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.right > docWidth + 0.5 && !hasScrollAncestor(el)) {
                results.push({
                    tag: el.tagName,
                    id: el.id,
                    className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : '',
                    rect: { left: rect.left, right: rect.right, width: rect.width },
                    text: el.innerText ? el.innerText.trim().slice(0, 30) : ''
                });
            }
        }
        return results;
    }""")
    
    print(f"True unconstrained overflowing elements: {len(true_overflowers)}")
    for item in true_overflowers:
        print(item)
        
    browser.close()
