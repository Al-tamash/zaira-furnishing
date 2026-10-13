import json
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "tablet": {"width": 768, "height": 1024},
    "mobile": {"width": 375, "height": 812}
}

ROUTES = ["/account", "/account/orders"]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    results = {}
    
    for route in ROUTES:
        results[route] = {}
        for vp_name, vp_size in VIEWPORTS.items():
            context = browser.new_context(viewport=vp_size)
            page = context.new_page()
            
            console_errors = []
            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
            
            response = page.goto(f"{BASE_URL}{route}", wait_until="networkidle")
            status = response.status if response else None
            
            overflow = page.evaluate("""() => {
                const doc = document.documentElement;
                return {
                    scrollWidth: doc.scrollWidth,
                    clientWidth: doc.clientWidth,
                    diff: doc.scrollWidth - doc.clientWidth
                };
            }""")
            
            results[route][vp_name] = {
                "status": status,
                "overflow": overflow,
                "console_errors": console_errors
            }
            context.close()
            
    browser.close()
    print(json.dumps(results, indent=2))
