import urllib.request
import urllib.parse
import ssl
import re
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://sjskaushambi.org/menu/photogallery/DisplayPhotosFull.aspx?ID=4EkVqLQ1UUU='
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

with urllib.request.urlopen(req, timeout=15, context=ctx) as r:
    html = r.read().decode('utf-8', errors='ignore')

print('Album Page HTML Length:', len(html))

# Save html for inspection
with open('album.html', 'w', encoding='utf-8') as f:
    f.write(html)

imgs = re.findall(r'src=["\']([^"\']+)["\']', html)
hrefs = re.findall(r'href=["\']([^"\']+)["\']', html)

# Also check for data-src, data-original, or urls in javascript
data_imgs = re.findall(r'["\'](https?://[^"\']+\.(?:jpg|jpeg|png|JPG|JPEG|PNG))["\']', html)
relative_imgs = re.findall(r'["\']([^"\']+\.(?:jpg|jpeg|png|JPG|JPEG|PNG))["\']', html)

all_candidates = set()
for s in imgs + hrefs + data_imgs + relative_imgs:
    full = urllib.parse.urljoin(url, s)
    all_candidates.add(full)

print(f"Total candidates found: {len(all_candidates)}")
photos = [u for u in all_candidates if any(k in u for k in ['PhotoAlbum', 'Full', 'Photo_', 'Thumb'])]
print(f"Album photos found: {len(photos)}")
for p in sorted(photos):
    print("PHOTO:", p)

with open('album_photos.txt', 'w', encoding='utf-8') as f:
    for p in sorted(photos):
        f.write(p + '\n')
