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
    kecamatans = [
        "Bumi Waras", "Enggal", "Kedamaian", "Kedaton", "Kemiling", 
        "Labuhan Ratu", "Langkapura", "Panjang", "Rajabasa", "Sukabumi", 
        "Sukarame", "Tanjung Karang Barat", "Tanjung Karang Pusat", "Tanjung Karang Timur", 
        "Tanjung Senang", "Teluk Betung Barat", "Teluk Betung Selatan", "Teluk Betung Timur", 
        "Teluk Betung Utara", "Way Halim"
    ]
    
    # Kombinasikan dengan kata kunci utama
    search_queries = []
    for kec in kecamatans:
        search_queries.append(f"Cafe di {kec} Bandar Lampung")
        search_queries.append(f"Tempat makan di {kec} Bandar Lampung")
    
    # Gunakan dictionary untuk mencegah duplikasi (kunci = URL unik atau nama)
    data_dict = {}
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(locale='id-ID', viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        
        for query in search_queries:
            print(f"\n=============================================")
            print(f"Memulai pencarian untuk: '{query}'")
            print(f"=============================================")
            
            # Format query string
            encoded_query = query.replace(' ', '+')
            page.goto(f"https://www.google.com/maps/search/{encoded_query}", timeout=60000)
            
            # Wait for results
            try:
                page.wait_for_selector('div[role="feed"]', timeout=15000)
                time.sleep(3)
            except:
                print(f"Tidak dapat memuat feed untuk '{query}', melewati...")
                continue
            
            print("Men-scroll daftar hasil untuk memuat data (harapkan beberapa detik)...")
            feed = page.locator('div[role="feed"]')
            if feed.count() > 0:
                feed.hover()
                for _ in range(30): # 30 scroll per kata kunci agar seimbang
                    page.mouse.wheel(0, 5000)
                    time.sleep(2)
                
            print("Mengumpulkan link tempat...")
            link_elements = page.locator('div[role="feed"] a[href*="/maps/place/"]').element_handles()
            hrefs = []
            for el in link_elements:
                href = el.get_attribute("href")
                if href:
                    # Clean URL to use as unique key (remove query parameters)
                    clean_href = href.split('?')[0]
                    if clean_href not in hrefs:
                        hrefs.append(href)
                    
            print(f"Ditemukan {len(hrefs)} tempat potensial dari query '{query}'.")
            
            for href in hrefs:
                clean_href = href.split('?')[0]
                if clean_href in data_dict:
                    # Skip jika sudah pernah di-scrape di query sebelumnya
                    continue
                    
                try:
                    page.goto(href, timeout=30000)
                    time.sleep(3)
                    
                    # 1. Name
                    name_el = page.locator('h1').first
                    if name_el.count() == 0:
                        continue
                    name = name_el.inner_text()
                    
                    body_text = page.locator('body').inner_text()

                    # 2. Review Count & Rating
                    review_count = 0
                    rating = 0.0
                    match = re.search(r'([\d\.,]+)\s+(?:ulasan|reviews)', body_text, re.IGNORECASE)
                    if match:
                        num_str = match.group(1).replace('.', '').replace(',', '')
                        if num_str.isdigit():
                            review_count = int(num_str)
                    else:
                        match2 = re.search(r'\(([\d\.,]+)\)', body_text)
                        if match2:
                            num_str = match2.group(1).replace('.', '').replace(',', '')
                            if num_str.isdigit() and int(num_str) < 50000:
                                review_count = int(num_str)
                                
                    rating_el = page.locator('span[aria-label*="bintang"], span[aria-label*="stars"]').first
                    if rating_el.count() > 0:
                        aria_label = rating_el.get_attribute('aria-label')
                        if aria_label:
                            rating_match = re.search(r'([\d\.,]+)', aria_label)
                            if rating_match:
                                try:
                                    rating = float(rating_match.group(1).replace(',', '.'))
                                except:
                                    pass
                    
                    if rating == 0.0:
                        match_rating = re.search(r'(\d[\.,]\d)\s*\(', body_text)
                        if match_rating:
                            try:
                                rating = float(match_rating.group(1).replace(',', '.'))
                            except:
                                pass
                    if review_count < 25:
                        print(f"[-] {name} diabaikan (Review: {review_count} < 25)")
                        continue
                        
                    # 3. Photos
                    photo_urls = []
                    img_els = page.locator('img').element_handles()
                    for img in img_els:
                        src = img.get_attribute('src')
                        if src and src.startswith('http') and ('googleusercontent.com' in src):
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
                        cat_btns = page.locator('button.DkEaL').element_handles()
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
                    
                    # 7. Jam Operasional
                    hours_el = page.locator('div[aria-label^="Jam buka"], button[data-item-id="oh"]').first
                    hours = hours_el.inner_text().replace('\n', ' ') if hours_el.count() > 0 else ''
                    
                    # 8. Nomor Telepon
                    phone_el = page.locator('button[data-tooltip="Salin nomor telepon"], button[data-item-id^="phone:tel:"]').first
                    phone = phone_el.inner_text().replace('\n', '') if phone_el.count() > 0 else ''
                    
                    # 9. Website
                    web_el = page.locator('a[data-item-id="authority"]').first
                    website = web_el.get_attribute('href') if web_el.count() > 0 else ''
                    
                    # 10. Tingkat Harga (Price Level)
                    price_level = 0
                    if '$$$$' in body_text: price_level = 4
                    elif '$$$' in body_text: price_level = 3
                    elif '$$' in body_text: price_level = 2
                    elif '$' in body_text: price_level = 1
                    
                    # 11. Fasilitas (Amenities)
                    amenities = []
                    if "Bawa pulang" in body_text or "Takeaway" in body_text: amenities.append("Takeaway")
                    if "Pesan antar" in body_text or "Delivery" in body_text: amenities.append("Delivery")
                    if "Tempat duduk di luar ruangan" in body_text or "Outdoor" in body_text: amenities.append("Outdoor Seating")
                    if "Wi-Fi" in body_text or "WiFi" in body_text: amenities.append("WiFi")
                    if "Ramah anak" in body_text: amenities.append("Kids Friendly")
                    
                    print(f"[+] Tersimpan: {name} | Rating: {rating} | {review_count} ulasan")
                    
                    # Simpan ke dictionary menggunakan clean_href sebagai kunci
                    data_dict[clean_href] = {
                        'name': name,
                        'lat': lat,
                        'lng': lng,
                        'address': address,
                        'category': category,
                        'rating': rating,
                        'review_count': review_count,
                        'hours': hours,
                        'phone': phone,
                        'website': website,
                        'price_level': price_level,
                        'amenities': amenities,
                        'photos': photo_urls,
                        'gmaps_url': href
                    }
                    
                except Exception as e:
                    print(f"[!] Error saat memproses {href}: {str(e)}")
                    
        browser.close()
        
    # Convert dictionary to list
    data = list(data_dict.values())
    
    # Save to file
    with open('cafes_gmaps_v2.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
        
    print(f"\nSelesai! {len(data)} tempat berhasil dikumpulkan dan disimpan ke cafes_gmaps_v2.json")

if __name__ == "__main__":
    scrape_gmaps()
