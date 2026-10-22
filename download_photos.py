import urllib.request
import ssl
import os
from PIL import Image

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

os.makedirs('assets/sjs_gallery', exist_ok=True)

photo_ids = [
    "222215", "222746", "223106", "224138", "224529",
    "225122", "225872", "227170", "227920", "228329",
    "228922", "229251", "229813", "230204", "230657",
    "231814", "232283", "233252", "233596", "233924"
]

print(f"Downloading {len(photo_ids)} official photos from St. Joseph's album...")

downloaded = []
for pid in photo_ids:
    url = f"https://s3-noi.aces3.ai/franciscan/SchImg/SJSKAU/PhotoAlbum/Full/Photo_{pid}.JPG"
    target = f"assets/sjs_gallery/photo_{pid}.jpg"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=12, context=ctx) as r, open(target, 'wb') as f:
            f.write(r.read())
        
        with Image.open(target) as im:
            w, h = im.size
            size_kb = os.path.getsize(target) / 1024
            print(f"Saved: {target} ({w}x{h}, {size_kb:.1f} KB)")
            downloaded.append(target)
    except Exception as e:
        print(f"Failed {pid}: {e}")

print(f"\nSuccessfully downloaded {len(downloaded)} / {len(photo_ids)} photos!")
