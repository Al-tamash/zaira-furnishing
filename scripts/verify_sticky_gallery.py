import os
import json
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
os.makedirs("audit_results/sticky_check", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    
    page.goto(f"{BASE_URL}/products/blackout-curtains", wait_until="networkidle")
    
    # 1. Initial position of gallery
    initial_rect = page.evaluate("""() => {
        const el = document.querySelector('.lg\\\\:sticky');
        const rect = el.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, height: rect.height, position: window.getComputedStyle(el).position };
    }""")
    print("Initial gallery rect:", initial_rect)
    
    # Capture initial desktop screenshot
    page.screenshot(path="audit_results/sticky_check/01_desktop_initial.png")
    
    # 2. Scroll down 400px
    page.evaluate("window.scrollBy(0, 400)")
    page.wait_for_timeout(500)
    
    # Check rect after scroll
    scrolled_rect = page.evaluate("""() => {
        const el = document.querySelector('.lg\\\\:sticky');
        const rect = el.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, height: rect.height, scrollY: window.scrollY };
    }""")
    print("Scrolled gallery rect:", scrolled_rect)
    
    # Capture scrolled desktop screenshot
    page.screenshot(path="audit_results/sticky_check/02_desktop_scrolled.png")
    
    # Verify overflow on desktop & mobile
    desktop_overflow = page.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
    
    # Mobile check
    m_context = browser.new_context(viewport={"width": 375, "height": 812})
    m_page = m_context.new_page()
    m_page.goto(f"{BASE_URL}/products/blackout-curtains", wait_until="networkidle")
    mobile_overflow = m_page.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
    m_page.screenshot(path="audit_results/sticky_check/03_mobile_view.png")
    m_context.close()
    
    context.close()
    browser.close()
    
    print(f"\nDesktop Overflow Diff: {desktop_overflow}px")
    print(f"Mobile Overflow Diff: {mobile_overflow}px")
    print("Screenshots saved in audit_results/sticky_check/")
