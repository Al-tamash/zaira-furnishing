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
    
    # 1. Test /admin/login across viewports
    results["/admin/login"] = {}
    for vp_name, vp_size in VIEWPORTS.items():
        context = browser.new_context(viewport=vp_size)
        page = context.new_page()
        
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        
        response = page.goto(f"{BASE_URL}/admin/login", wait_until="networkidle")
        status = response.status if response else None
        
        overflow = page.evaluate("""() => {
            const doc = document.documentElement;
            return {
                scrollWidth: doc.scrollWidth,
                clientWidth: doc.clientWidth,
                diff: doc.scrollWidth - doc.clientWidth
            };
        }""")
        
        results["/admin/login"][vp_name] = {
            "status": status,
            "overflow": overflow,
            "console_errors": console_errors
        }
        
        if vp_name == "desktop":
            results["/admin/login"]["email_input"] = page.locator("#admin-email").count() > 0
            results["/admin/login"]["password_input"] = page.locator("#admin-password").count() > 0
            results["/admin/login"]["submit_button"] = page.locator("button[type='submit']").count() > 0
            
        context.close()
        
    # 2. Test /admin redirect when unauthenticated
    context = browser.new_context(viewport=VIEWPORTS["desktop"])
    page = context.new_page()
    page.goto(f"{BASE_URL}/admin", wait_until="networkidle")
    final_url = page.url
    results["/admin_unauthenticated"] = {
        "final_url": final_url,
        "redirected_to_login": "/admin/login" in final_url
    }
    context.close()
    
    browser.close()
    print(json.dumps(results, indent=2))
