# pyrefly: ignore [missing-import]
from playwright.sync_api import sync_playwright
import json
import time
import re

def parse_review_count(text):
    if not text:
        return 0
    # Remove non-digits
    digits = re.sub(r'[^\d]', '', text)
    return int(digits) if digits else 0

def scrape_gmaps():
    data = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False) # Headless=False so we can see it
        context = browser.new_context(locale='id-ID', viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        
        print("Membuka Google Maps untuk pencarian...")
        page.goto("https://www.google.com/maps/search/Cafe+di+Bandar+Lampung", timeout=60000)
        
        # Wait for results
        page.wait_for_selector('div[role="feed"]', timeout=30000)
        time.sleep(3)
        
        print("Men-scroll daftar hasil untuk memuat data (harapkan beberapa detik)...")
        # Scroll the feed a few times to load more items
        for _ in range(15):
            page.mouse.wheel(0, 5000)
            time.sleep(2)
            
        print("Mengumpulkan link cafe...")
        # Get all links to places
        link_elements = page.locator('div[role="feed"] a[href*="/maps/place/"]').element_handles()
        hrefs = []
        for el in link_elements:
            href = el.get_attribute("href")
            if href and href not in hrefs:
                hrefs.append(href)
                
        print(f"Ditemukan {len(hrefs)} cafe potensial.")
        
        for href in hrefs:
            try:
                page.goto(href, timeout=30000)
                time.sleep(3)
                
                # 1. Name
                name_el = page.locator('h1').first
                if name_el.count() == 0:
                    print(f"[!] Tidak dapat menemukan judul (h1) untuk {href}")
                    continue
                name = name_el.inner_text()
                
                # 2. Review Count
                review_count = 0
                # Mencari elemen yang mengandung teks ulasan
                review_els = page.locator('button, span, div').filter(has_text=re.compile(r'\([\d\.,]+\)|[\d\.,]+\s+ulasan|[\d\.,]+\s+reviews', re.IGNORECASE)).element_handles()
                for el in review_els:
                    text = el.inner_text()
                    if text and ('ulasan' in text.lower() or 'review' in text.lower() or '(' in text):
                        val = parse_review_count(text)
                        if val > review_count:
                            review_count = val
                            
                if review_count < 50:
                    print(f"[-] {name} diabaikan (Review: {review_count} < 50)")
                    continue
                    
                # 3. Photos
                photo_urls = []
                img_els = page.locator('img').element_handles()
                for img in img_els:
                    src = img.get_attribute('src')
                    if src and src.startswith('http') and ('googleusercontent.com' in src):
                        # Coba naikkan resolusi
                        large_src = src.split('=')[0] + '=s1024-k-no'
                        if large_src not in photo_urls:
                            photo_urls.append(large_src)
                        
                if len(photo_urls) == 0:
                    print(f"[-] {name} diabaikan (Tidak ada foto utama)")
                    continue
                    
                # 4. Kategori
                cat_el = page.locator('button[jsaction="pane.rating.category"]').first
                category = cat_el.inner_text() if cat_el.count() > 0 else 'Cafe'
                if category == '' or category == 'Cafe':
                    # Coba cari dari tombol yang umum
                    cat_btns = page.locator('button.DkEaL').element_handles() # sering jadi class untuk kategori
                    for btn in cat_btns:
                        txt = btn.inner_text()
                        if txt and len(txt) > 3 and '\n' not in txt:
                            category = txt
                            break
                
                # 5. Lat & Lng
                current_url = page.url
                lat = 0
                lng = 0
                if '!3d' in current_url and '!4d' in current_url:
                    parts = current_url.split('!3d')
                    if len(parts) > 1:
                        lat_lng_part = parts[1].split('!4d')
                        lat = float(lat_lng_part[0])
                        lng = float(lat_lng_part[1].split('!')[0])
                elif '@' in current_url:
                    parts = current_url.split('@')[1].split(',')
                    lat = float(parts[0])
                    lng = float(parts[1])
                    
                # 6. Alamat
                address_el = page.locator('button[data-item-id="address"]').first
                address = address_el.inner_text() if address_el.count() > 0 else ''
                
                print(f"[+] Tersimpan: {name} | {category} | {review_count} ulasan")
                
                data.append({
                    'name': name,
                    'lat': lat,
                    'lng': lng,
                    'address': address,
                    'category': category,
                    'review_count': review_count,
                    'photos': photo_urls,
                    'gmaps_url': href
                })
                
                # Cukup ambil maks 30 untuk percobaan
                if len(data) >= 30:
                    break
                    
            except Exception as e:
                print(f"[!] Error saat memproses {href}: {str(e)}")
                
        browser.close()
        
    # Save to file
    with open('cafes_gmaps.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
        
    print(f"\nSelesai! {len(data)} cafe berhasil disimpan ke cafes_gmaps.json")

if __name__ == "__main__":
    scrape_gmaps()
