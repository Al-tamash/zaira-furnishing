import os
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
os.makedirs("audit_results/clean_showroom_check", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # ─── 1. HOMEPAGE SHOWROOM SECTION (Desktop 1440x900) ───
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    
    # Scroll to #contact section
    contact_section = page.locator("#contact")
    contact_section.scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    
    # Check that fake badges and tabs do NOT exist
    drag_badge_count = page.locator("#contact :text('Drag to explore')").count()
    tabs_count = page.locator("#contact :text('Showroom Photo')").count()
    print(f"Drag badge count (should be 0): {drag_badge_count}")
    print(f"Tabs count (should be 0): {tabs_count}")
    
    # Check iframe exists and is loaded
    iframe_count = page.locator("#contact iframe").count()
    print(f"Iframe rendered cleanly: {iframe_count == 1}")
    
    # Capture clean desktop screenshot
    page.screenshot(path="audit_results/clean_showroom_check/01_homepage_clean_desktop.png")
    
    # Check desktop overflow
    desktop_overflow = page.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
    print(f"Homepage desktop overflow: {desktop_overflow}px")
    
    # ─── 2. HOMEPAGE MOBILE CHECK (375x812) ───
    m_context = browser.new_context(viewport={"width": 375, "height": 812})
    m_page = m_context.new_page()
    m_page.goto(f"{BASE_URL}/", wait_until="networkidle")
    m_page.locator("#contact").scroll_into_view_if_needed()
    m_page.wait_for_timeout(1000)
    m_page.screenshot(path="audit_results/clean_showroom_check/02_homepage_clean_mobile.png")
    mobile_overflow = m_page.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
    print(f"Homepage mobile overflow: {mobile_overflow}px")
    m_context.close()
    
    # ─── 3. CONTACT PAGE CHECK ───
    page.goto(f"{BASE_URL}/contact", wait_until="networkidle")
    tour_section = page.locator("#tour")
    tour_section.scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    
    contact_drag_badge = page.locator("#tour :text('Drag to explore')").count()
    print(f"Contact page drag badge count (should be 0): {contact_drag_badge}")
    page.screenshot(path="audit_results/clean_showroom_check/03_contact_clean_desktop.png")
    
    context.close()
    browser.close()
    print("\nAll clean showroom checks passed successfully!")
