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
    
    # 1. Test /checkout redirect
    context = browser.new_context(viewport=VIEWPORTS["desktop"])
    page = context.new_page()
    response = page.goto(f"{BASE_URL}/checkout", wait_until="networkidle")
    final_url = page.url
    results["checkout_redirect"] = {
        "final_url": final_url,
        "is_cart": "/cart" in final_url
    }
    context.close()
    
    # 2. Test /cart across viewports (empty state)
    for vp_name, vp_size in VIEWPORTS.items():
        context = browser.new_context(viewport=vp_size)
        page = context.new_page()
        
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        
        response = page.goto(f"{BASE_URL}/cart", wait_until="networkidle")
        status = response.status if response else None
        
        overflow = page.evaluate("""() => {
            const doc = document.documentElement;
            return {
                scrollWidth: doc.scrollWidth,
                clientWidth: doc.clientWidth,
                diff: doc.scrollWidth - doc.clientWidth
            };
        }""")
        
        results[f"cart_empty_{vp_name}"] = {
            "status": status,
            "overflow": overflow,
            "console_errors": console_errors,
            "empty_state_visible": page.locator("text=Your Shortlist is Empty").count() > 0
        }
        context.close()
        
    # 3. Test /cart with shortlisted items populated
    context = browser.new_context(viewport=VIEWPORTS["desktop"])
    page = context.new_page()
    page.goto(f"{BASE_URL}/cart", wait_until="networkidle")
    # Inject a cart item via localStorage
    page.evaluate("""() => {
        const testCart = [{
            id: "test-prod-1",
            productId: "prod_blackout_curtains",
            name: "Bespoke Blackout Curtains",
            slug: "blackout-curtains",
            image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
            quantity: 2,
            variantName: "Warm Beige",
            sizeLabel: "Custom Window (7ft drop)",
            unitPrice: 0,
            totalPrice: 0
        }];
        localStorage.setItem("zaira_cart", JSON.stringify(testCart));
        window.dispatchEvent(new Event("storage"));
    }""")
    page.reload(wait_until="networkidle")
    
    # Check populated cart UI
    items_count = page.locator(".font-serif.text-\\[15px\\]").count()
    summary_visible = page.locator("text=Inquiry Summary").count() > 0
    wa_btn_visible = page.locator("text=Send Shortlist to WhatsApp").count() > 0
    
    results["cart_populated_test"] = {
        "items_count": items_count,
        "summary_visible": summary_visible,
        "whatsapp_button_visible": wa_btn_visible
    }
    
    # Also verify mobile with items populated
    m_context = browser.new_context(viewport=VIEWPORTS["mobile"])
    m_page = m_context.new_page()
    m_page.goto(f"{BASE_URL}/cart", wait_until="networkidle")
    m_page.evaluate("""() => {
        const testCart = [{
            id: "test-prod-1",
            productId: "prod_blackout_curtains",
            name: "Bespoke Blackout Curtains",
            slug: "blackout-curtains",
            image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
            quantity: 2,
            variantName: "Warm Beige",
            sizeLabel: "Custom Window (7ft drop)",
            unitPrice: 0,
            totalPrice: 0
        }];
        localStorage.setItem("zaira_cart", JSON.stringify(testCart));
    }""")
    m_page.reload(wait_until="networkidle")
    m_overflow = m_page.evaluate("""() => {
        const doc = document.documentElement;
        return {
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            diff: doc.scrollWidth - doc.clientWidth
        };
    }""")
    results["cart_populated_mobile_overflow"] = m_overflow
    m_context.close()
    
    context.close()
    browser.close()
    
    print(json.dumps(results, indent=2))
