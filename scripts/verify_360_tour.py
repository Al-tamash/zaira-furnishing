import os
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
os.makedirs("audit_results/tour_check", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # ─── 1. VERIFY CONTACT PAGE TOUR (Desktop 1440x900) ───
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    
    print("\n--- Testing Contact Page ---")
    page.goto(f"{BASE_URL}/contact", wait_until="networkidle")
    
    # Check if iframe exists in #tour
    tour_section = page.locator("#tour")
    tour_count = tour_section.count()
    print(f"Tour section found: {tour_count == 1}")
    
    iframe = page.locator("#tour iframe")
    iframe_src = iframe.get_attribute("src")
    print(f"Iframe src matches Google 360 tour: {'1791894683148' in (iframe_src or '')}")
    
    # Check overflow
    contact_desktop_overflow = page.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
    print(f"Contact page desktop overflow: {contact_desktop_overflow}px")
    
    # Scroll to tour and screenshot
    tour_section.scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    page.screenshot(path="audit_results/tour_check/01_contact_tour_desktop.png")
    
    # Mobile check on contact page
    m_context = browser.new_context(viewport={"width": 375, "height": 812})
    m_page = m_context.new_page()
    m_page.goto(f"{BASE_URL}/contact", wait_until="networkidle")
    contact_mobile_overflow = m_page.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
    print(f"Contact page mobile overflow: {contact_mobile_overflow}px")
    m_page.locator("#tour").scroll_into_view_if_needed()
    m_page.wait_for_timeout(1000)
    m_page.screenshot(path="audit_results/tour_check/02_contact_tour_mobile.png")
    m_context.close()
    
    # ─── 2. VERIFY HOMEPAGE TOUR TOGGLE ───
    print("\n--- Testing Homepage Showroom Section ---")
    page.goto(f"{BASE_URL}/#contact", wait_until="networkidle")
    
    home_section = page.locator("#contact")
    home_section.scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    
    # Check default 360 tour view on homepage
    home_iframe = page.locator("#contact iframe")
    print(f"Homepage iframe rendered: {home_iframe.count() == 1}")
    page.screenshot(path="audit_results/tour_check/03_homepage_tour_active.png")
    
    # Click "Showroom Photo" toggle button
    photo_btn = page.locator("#contact button:has-text('Showroom Photo')")
    photo_btn.click()
    page.wait_for_timeout(500)
    
    # Check photo view is now active
    has_image = page.locator("#contact img[alt*='Zaira Furnishing interior showroom']").count() > 0
    print(f"Homepage photo view toggled successfully: {has_image}")
    page.screenshot(path="audit_results/tour_check/04_homepage_photo_toggled.png")
    
    # Click back to 360 tour
    tour_btn = page.locator("#contact button").filter(has_text="Virtual Tour").first
    tour_btn.click()
    page.wait_for_timeout(500)
    print(f"Homepage switched back to 360 tour: {page.locator('#contact iframe').count() == 1}")
    
    home_overflow = page.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
    print(f"Homepage desktop overflow: {home_overflow}px")
    
    context.close()
    browser.close()
    print("\nAll verification checks completed!")
