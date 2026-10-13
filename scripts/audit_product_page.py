import json
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "tablet": {"width": 768, "height": 1024},
    "mobile": {"width": 375, "height": 812}
}

SLUGS_TO_TEST = [
    "blackout-curtains",
    "roller-blinds",
    "monaco-crush-resistant-matte-velvet",
    "botanical-textured-wallcovering",
    "ortho-contour-hybrid-pocket-spring-mattress"
]

results = {}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    for slug in SLUGS_TO_TEST:
        url = f"{BASE_URL}/products/{slug}"
        print(f"\n--- Testing Product: {slug} ---")
        slug_results = {"url": url, "viewports": {}, "interactions": {}}
        
        for vp_name, vp_size in VIEWPORTS.items():
            context = browser.new_context(viewport=vp_size)
            page = context.new_page()
            
            console_errors = []
            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
            
            response = page.goto(url, wait_until="networkidle", timeout=30000)
            status = response.status if response else None
            
            # Check overflow
            overflow = page.evaluate("""() => {
                const doc = document.documentElement;
                return {
                    scrollWidth: doc.scrollWidth,
                    clientWidth: doc.clientWidth,
                    diff: doc.scrollWidth - doc.clientWidth
                };
            }""")
            
            slug_results["viewports"][vp_name] = {
                "status": status,
                "overflow": overflow,
                "console_errors": console_errors
            }
            print(f"[{vp_name}] Status: {status}, Overflow diff: {overflow['diff']}, Errors: {len(console_errors)}")
            
            if vp_name == "desktop":
                # Test basic desktop interactions
                title = page.title()
                h1_text = page.locator("h1").first.inner_text() if page.locator("h1").count() > 0 else "NO H1"
                slug_results["interactions"]["title"] = title
                slug_results["interactions"]["h1"] = h1_text
                
                # Check for swatches
                swatch_count = page.locator("button[aria-label*='Select'], button[aria-label*='variant']").count()
                slug_results["interactions"]["swatch_count"] = swatch_count
                
                # Check WhatsApp CTA
                wa_links = page.locator("a[href*='wa.me']").count()
                slug_results["interactions"]["whatsapp_links"] = wa_links
                
            elif vp_name == "mobile":
                # Check sticky bar on mobile
                sticky_bar = page.locator(".fixed.bottom-0").count()
                slug_results["interactions"]["mobile_sticky_bar"] = sticky_bar
            
            context.close()
            
        results[slug] = slug_results

    browser.close()

print("\n=== SUMMARY RESULTS ===")
print(json.dumps(results, indent=2))
