import json
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    console_logs = []
    page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
    
    response = page.goto("http://localhost:3000/", wait_until="networkidle")
    
    # 1. Heading hierarchy
    headings = page.evaluate("""() => {
        const els = document.querySelectorAll('h1, h2, h3, h4');
        return Array.from(els).map(el => ({
            tag: el.tagName,
            text: el.innerText.trim(),
            visible: el.offsetParent !== null
        }));
    }""")
    
    # 2. Broken images check
    images = page.evaluate("""() => {
        const imgs = document.querySelectorAll('img');
        return Array.from(imgs).map(img => ({
            src: img.src,
            alt: img.alt,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            complete: img.complete,
            isBroken: img.complete && img.naturalWidth === 0
        }));
    }""")
    broken_images = [img for img in images if img['isBroken']]
    missing_alt = [img for img in images if not img['alt']]
    
    # 3. Interactive testing: Hero slider
    hero_next_btn = page.locator("button[aria-label*='Next'], button[title*='Next']").first
    hero_has_next = hero_next_btn.count() > 0
    if hero_has_next and hero_next_btn.is_visible():
        hero_next_btn.click()
        page.wait_for_timeout(500)
        
    # 4. Interactive testing: FAQ accordions
    faq_triggers = page.locator("button:has-text('?'), [data-faq-trigger]")
    faq_count = faq_triggers.count()
    faq_tested = 0
    if faq_count > 0:
        faq_triggers.first.click()
        page.wait_for_timeout(300)
        faq_tested = 1

    # 5. Check all links
    links = page.evaluate("""() => {
        const allLinks = document.querySelectorAll('a[href]');
        return Array.from(allLinks).map(a => ({
            href: a.getAttribute('href'),
            text: a.innerText.trim()
        }));
    }""")
    
    print("=== HOMEPAGE AUDIT RESULTS ===")
    print(f"Total headings: {len(headings)}")
    for h in headings[:8]:
        print(f"  {h['tag']}: {h['text'][:60]}")
    print(f"\nTotal images: {len(images)}")
    print(f"Broken images: {len(broken_images)}")
    for b in broken_images:
        print(f"  BROKEN: {b['src']}")
    print(f"Missing alt texts: {len(missing_alt)}")
    for ma in missing_alt[:5]:
        print(f"  NO ALT: {ma['src']}")
        
    print(f"\nInteractive checks:")
    print(f"  Hero slider next button: {'Found & Clicked' if hero_has_next else 'Not found'}")
    print(f"  FAQ accordion count: {faq_count}, clicked first: {faq_tested}")
    print(f"  Total links: {len(links)}")
    
    empty_links = [l for l in links if not l['href'] or l['href'] == '#' or l['href'].strip() == '']
    print(f"  Empty or '#' links: {len(empty_links)}")
    for el in empty_links:
        print(f"    Empty link: '{el['text']}' -> '{el['href']}'")

    print(f"\nConsole errors/warnings ({len(console_logs)}):")
    for log in console_logs:
        if "error" in log.lower() or "warning" in log.lower():
            print(f"  {log}")

    browser.close()
