import struct
import math

poly1 = [(0.0, 10.6), (36.8, 89.4), (58.4, 89.4), (21.6, 10.6)]
poly2 = [(63.2, 10.6), (84.8, 10.6), (100.0, 43.2), (78.4, 43.2)]

# Transform to fit nicely in 0..100 with 10% padding
def transform_poly(poly):
    res = []
    for x, y in poly:
        nx = 10.0 + x * 0.80
        ny = 10.0 + y * 0.80
        res.append((nx, ny))
    return res

t_poly1 = transform_poly(poly1)
t_poly2 = transform_poly(poly2)

def is_point_in_poly(x, y, poly):
    inside = False
    n = len(poly)
    for i in range(n):
        x1, y1 = poly[i]
        x2, y2 = poly[(i + 1) % n]
        if ((y1 > y) != (y2 > y)):
            x_intersect = (x2 - x1) * (y - y1) / (y2 - y1 + 1e-9) + x1
            if x < x_intersect:
                inside = not inside
    return inside

def rasterize_image(size):
    # Supersampling 4x4
    ss = 4
    pixels = []
    
    for row in range(size - 1, -1, -1): # bottom-to-top for BMP
        for col in range(size):
            inside_count = 0
            for sy in range(ss):
                for sx in range(ss):
                    px = ((col + (sx + 0.5) / ss) / size) * 100.0
                    py = (((size - 1 - row) + (sy + 0.5) / ss) / size) * 100.0
                    if is_point_in_poly(px, py, t_poly1) or is_point_in_poly(px, py, t_poly2):
                        inside_count += 1
            alpha = inside_count / (ss * ss)
            if alpha > 0:
                # Color #FF4655 -> R=255, G=70, B=85
                r = int(255 * alpha)
                g = int(70 * alpha)
                b = int(85 * alpha)
                a = int(255 * alpha)
                # BGRA format
                pixels.append(struct.pack('BBBB', b, g, r, a))
            else:
                pixels.append(struct.pack('BBBB', 0, 0, 0, 0))
    return b"".join(pixels)

def create_ico(sizes, output_path):
    # sizes: list of ints e.g. [16, 32, 48, 64, 128]
    num_images = len(sizes)
    # Header: 6 bytes
    header = struct.pack('<HHH', 0, 1, num_images)
    
    entries = []
    image_data_list = []
    offset = 6 + num_images * 16
    
    for s in sizes:
        raw_pixels = rasterize_image(s)
        # BMP info header: 40 bytes
        # biWidth = s, biHeight = 2 * s (for XOR + AND mask)
        bih = struct.pack('<IIIHHIIIIII', 40, s, s * 2, 1, 32, 0, len(raw_pixels), 0, 0, 0, 0)
        # AND mask (1 bit per pixel, padded to 32 bits per row)
        row_bytes = math.ceil(s / 32) * 4
        and_mask = b"\x00" * (row_bytes * s)
        
        img_blob = bih + raw_pixels + and_mask
        image_data_list.append(img_blob)
        
        # Directory entry (16 bytes)
        b_width = 0 if s >= 256 else s
        b_height = 0 if s >= 256 else s
        entry = struct.pack('<BBBBHHII', b_width, b_height, 0, 0, 1, 32, len(img_blob), offset)
        entries.append(entry)
        offset += len(img_blob)
        
    with open(output_path, 'wb') as f:
        f.write(header)
        for e in entries:
            f.write(e)
        for d in image_data_list:
            f.write(d)
    print(f"Generated {output_path} successfully ({offset} bytes)")

create_ico([16, 24, 32, 48, 64, 128], "valorant.ico")
