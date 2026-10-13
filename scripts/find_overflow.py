from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 375, "height": 812})
    page = context.new_page()
    page.goto("http://localhost:3000/", wait_until="networkidle")
    
    overflowing_elements = page.evaluate("""() => {
        const docWidth = document.documentElement.clientWidth;
        const results = [];
        const all = document.querySelectorAll('*');
        for (let el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.right > docWidth + 1 || el.scrollWidth > docWidth + 1) {
                results.push({
                    tag: el.tagName,
                    id: el.id,
                    className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 100) : '',
                    rect: { left: rect.left, right: rect.right, width: rect.width },
                    scrollWidth: el.scrollWidth,
                    text: el.innerText ? el.innerText.slice(0, 30) : ''
                });
            }
        }
        return results;
    }""")
    
    print(f"Total overflowing elements found: {len(overflowing_elements)}")
    for item in overflowing_elements[:15]:
        print(item)
        
    browser.close()
