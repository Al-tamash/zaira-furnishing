import os
import json
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
OUTPUT_DIR = "audit_results/baseline"

VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "tablet": {"width": 768, "height": 1024},
    "mobile": {"width": 375, "height": 812}
}

ROUTES_TO_AUDIT = [
    {"name": "home", "path": "/"},
    {"name": "about", "path": "/about"},
    {"name": "categories_index", "path": "/categories"},
    {"name": "category_curtains", "path": "/categories/curtains-drapes"},
    {"name": "subcategory_blackout", "path": "/categories/curtains-drapes/blackout"},
    {"name": "category_blinds", "path": "/categories/window-blinds-shades"},
    {"name": "subcategory_roller", "path": "/categories/window-blinds-shades/roller"},
    {"name": "category_sofa", "path": "/categories/sofa-fabrics-upholstery"},
    {"name": "category_wallpapers", "path": "/categories/wallpapers-wall-coverings"},
    {"name": "products_index", "path": "/products"},
    {"name": "product_blackout_curtains", "path": "/products/blackout-curtains"},
    {"name": "product_roller_blinds", "path": "/products/roller-blinds"},
    {"name": "services", "path": "/services"},
    {"name": "contact", "path": "/contact"},
    {"name": "cart", "path": "/cart"},
    {"name": "checkout", "path": "/checkout"},
    {"name": "account", "path": "/account"},
    {"name": "account_orders", "path": "/account/orders"},
    {"name": "admin_login", "path": "/admin/login"}
]

os.makedirs(f"{OUTPUT_DIR}/screenshots", exist_ok=True)

audit_report = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    for route in ROUTES_TO_AUDIT:
        route_name = route["name"]
        path = route["path"]
        url = f"{BASE_URL}{path}"
        print(f"\nAuditing [{route_name}] -> {url}...")
        
        route_result = {
            "name": route_name,
            "path": path,
            "url": url,
            "viewports": {},
            "console_errors": [],
            "failed_requests": [],
            "status": None
        }
        
        # Test across viewports
        for vp_name, vp_size in VIEWPORTS.items():
            context = browser.new_context(
                viewport=vp_size,
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            
            console_errors = []
            failed_requests = []
            
            page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error", "warning"] else None)
            page.on("requestfailed", lambda req: failed_requests.append(f"FAILED: {req.method} {req.url} - {req.failure}"))
            
            try:
                response = page.goto(url, wait_until="networkidle", timeout=30000)
                status = response.status if response else "NO_RESPONSE"
                if vp_name == "desktop":
                    route_result["status"] = status
                
                # Check for horizontal overflow
                overflow = page.evaluate("""() => {
                    const docEl = document.documentElement;
                    return {
                        scrollWidth: docEl.scrollWidth,
                        clientWidth: docEl.clientWidth,
                        hasOverflow: docEl.scrollWidth > docEl.clientWidth
                    };
                }""")
                
                # Take screenshot
                screenshot_filename = f"{OUTPUT_DIR}/screenshots/{route_name}_{vp_name}.png"
                page.screenshot(path=screenshot_filename, full_page=True)
                
                # Check essential elements
                has_header = page.locator("header").count() > 0 or page.locator("nav").count() > 0
                has_footer = page.locator("footer").count() > 0
                title = page.title()
                
                route_result["viewports"][vp_name] = {
                    "overflow": overflow,
                    "has_header": has_header,
                    "has_footer": has_footer,
                    "title": title,
                    "screenshot": screenshot_filename,
                    "errors_count": len(console_errors),
                    "failed_reqs_count": len(failed_requests)
                }
                
                if console_errors:
                    route_result["console_errors"].extend(console_errors)
                if failed_requests:
                    route_result["failed_requests"].extend(failed_requests)
                    
                print(f"  [{vp_name}] Status: {status} | Overflow: {overflow['hasOverflow']} (scroll: {overflow['scrollWidth']}, client: {overflow['clientWidth']})")
                
            except Exception as e:
                print(f"  [{vp_name}] Exception: {str(e)}")
                route_result["viewports"][vp_name] = {"error": str(e)}
            finally:
                context.close()
                
        audit_report.append(route_result)

    browser.close()

with open(f"{OUTPUT_DIR}/audit_summary.json", "w") as f:
    json.dump(audit_report, f, indent=2)

print("\nAudit complete! Summary saved to", f"{OUTPUT_DIR}/audit_summary.json")
