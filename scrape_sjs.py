import urllib.request
import urllib.parse
import ssl
import re
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

base_url = 'https://sjskaushambi.org'

def fetch_html(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=12, context=ctx) as r:
            return r.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

home_html = fetch_html(base_url)
links = re.findall(r'href=["\']([^"\']+)["\']', home_html)
imgs = re.findall(r'src=["\']([^"\']+)["\']', home_html)

print(f"Homepage total links: {len(links)}")
print(f"Homepage total images: {len(imgs)}")

target_pages = []
for l in set(links):
    l_lower = l.lower()
    if any(k in l_lower for k in ['gallery', 'annual', 'function', 'photo', 'event', 'celebration', 'cultural']):
        full = urllib.parse.urljoin(base_url, l)
        target_pages.append(full)

print("Target gallery / event pages found:")
for p in target_pages:
    print(" -", p)

# Also let's check for sub-links or images on these gallery pages
all_found_images = []
for src in imgs:
    if any(ext in src.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
        all_found_images.append(urllib.parse.urljoin(base_url, src))

for page in target_pages[:8]:
    p_html = fetch_html(page)
    p_imgs = re.findall(r'src=["\']([^"\']+)["\']', p_html)
    p_links = re.findall(r'href=["\']([^"\']+)["\']', p_html)
    for src in p_imgs:
        if any(ext in src.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
            all_found_images.append(urllib.parse.urljoin(base_url, src))
    for l in p_links:
        if any(ext in l.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
            all_found_images.append(urllib.parse.urljoin(base_url, l))

unique_images = sorted(list(set(all_found_images)))
print(f"\nTotal unique image URLs discovered across site: {len(unique_images)}")
with open('discovered_images.txt', 'w', encoding='utf-8') as f:
    for u in unique_images:
        f.write(u + '\n')

for u in unique_images[:30]:
    print(" *", u)
