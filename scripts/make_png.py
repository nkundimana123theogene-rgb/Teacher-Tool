import zlib
import struct

def make_png(filename, width, height, color=(2, 6, 23)):
    # Simple solid/gradient PNG generator using standard python library
    raw_data = bytearray()
    r_bg, g_bg, b_bg = color
    
    for y in range(height):
        raw_data.append(0) # filter byte none
        for x in range(width):
            # Create nice lime/slate gradient with center star accent
            dx = x - width / 2
            dy = y - height / 2
            dist = (dx*dx + dy*dy) ** 0.5
            
            if dist < width * 0.35:
                # Lime center emblem
                r, g, b = 163, 230, 53
            elif dist < width * 0.42:
                # Gold ring
                r, g, b = 250, 204, 21
            else:
                # Slate dark bg
                r = int(r_bg + (x / width) * 20)
                g = int(g_bg + (y / height) * 30)
                b = int(b_bg + 20)
                
            raw_data.extend([r, g, b])
            
    compressed = zlib.compress(raw_data)
    
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
    idat = chunk(b'IDAT', compressed)
    iend = chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(header + ihdr + idat + iend)

make_png('public/pwa-192x192.png', 192, 192)
make_png('public/pwa-512x512.png', 512, 512)
print("Generated PNG icons successfully!")
