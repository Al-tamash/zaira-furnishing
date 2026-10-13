import json
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "tablet": {"width": 768, "height": 1024},
    "mobile": {"width": 375, "height": 812}
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    results = {}
    url = f"{BASE_URL}/services"
    
    for vp_name, vp_size in VIEWPORTS.items():
        context = browser.new_context(viewport=vp_size)
        page = context.new_page()
        
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        
        response = page.goto(url, wait_until="networkidle", timeout=30000)
        status = response.status if response else None
        
        overflow = page.evaluate("""() => {
            const doc = document.documentElement;
            return {
                scrollWidth: doc.scrollWidth,
                clientWidth: doc.clientWidth,
                diff: doc.scrollWidth - doc.clientWidth
            };
        }""")
        
        results[vp_name] = {
            "status": status,
            "overflow": overflow,
            "console_errors": console_errors
        }
        
        if vp_name == "desktop":
            results["title"] = page.title()
            results["h1"] = page.locator("h1").first.inner_text()
            results["services_count"] = page.locator(".scroll-mt-24.bg-white").count()
            results["whatsapp_links"] = page.locator("a[href*='wa.me']").count()
            # Test form inputs exist and are properly labeled
            results["name_input_exists"] = page.locator("#consultation-name").count() > 0
            results["phone_input_exists"] = page.locator("#consultation-phone").count() > 0
            results["submit_button_text"] = page.locator("button[type='submit']").inner_text()
            
        context.close()
        
    browser.close()
    print(json.dumps(results, indent=2))
