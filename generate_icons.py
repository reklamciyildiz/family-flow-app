#!/usr/bin/env python3
"""
Android icon generator for BİRLİK app
Generates all required icon sizes from birlik.jpg
"""

from PIL import Image
import os

# Input image
input_image = "birlik.jpg"

# Android icon sizes (in pixels)
sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

# Foreground icon sizes for adaptive icons (larger for safe zone)
foreground_sizes = {
    "mipmap-mdpi": 108,  # 108x108 for 48dp with safe zone
    "mipmap-hdpi": 162,  # 162x162 for 72dp
    "mipmap-xhdpi": 216,  # 216x216 for 96dp
    "mipmap-xxhdpi": 324,  # 324x324 for 144dp
    "mipmap-xxxhdpi": 432,  # 432x432 for 192dp
}

def create_icon_with_background(input_path, output_path, size, bg_color=(255, 255, 255)):
    """Create icon with white background"""
    # Open and resize input image
    img = Image.open(input_path).convert("RGBA")
    
    # Resize maintaining aspect ratio, then crop to square
    img.thumbnail((size, size), Image.Resampling.LANCZOS)
    
    # Create square canvas with background
    canvas = Image.new("RGBA", (size, size), bg_color)
    
    # Paste image centered
    x = (size - img.width) // 2
    y = (size - img.height) // 2
    canvas.paste(img, (x, y), img if img.mode == "RGBA" else None)
    
    # Convert to RGB for non-transparent PNG
    canvas_rgb = Image.new("RGB", canvas.size, bg_color)
    canvas_rgb.paste(canvas, mask=canvas.split()[3] if canvas.mode == "RGBA" else None)
    
    canvas_rgb.save(output_path, "PNG", optimize=True)
    print(f"✓ Created {output_path} ({size}x{size})")

def create_foreground_icon(input_path, output_path, size):
    """Create foreground icon (transparent background)"""
    img = Image.open(input_path).convert("RGBA")
    
    # Resize maintaining aspect ratio
    img.thumbnail((size, size), Image.Resampling.LANCZOS)
    
    # Create anew canvas with transparent background
    canvas = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    
    # Paste centered
    x = (size - img.width) // 2
    y = (size - img.height) // 2
    canvas.paste(img, (x, y), img)
    
    canvas.save(output_path, "PNG", optimize=True)
    print(f"✓ Created foreground {output_path} ({size}x{size})")

if __name__ == "__main__":
    if not os.path.exists(input_image):
        print(f"❌ Error: {input_image} not found!")
        exit(1)
    
    print(f"🎨 Generating Android icons from {input_image}...\n")
    
    # Generate regular launcher icons
    for folder, size in sizes.items():
        os.makedirs(f"android/app/src/main/res/{folder}", exist_ok=True)
        create_icon_with_background(
            input_image,
            f"android/app/src/main/res/{folder}/ic_launcher.png",
            size
        )
        create_icon_with_background(
            input_image,
            f"android/app/src/main/res/{folder}/ic_launcher_round.png",
            size
        )
    
    # Generate foreground icons for adaptive icons
    for folder, size in foreground_sizes.items():
        create_foreground_icon(
            input_image,
            f"android/app/src/main/res/{folder}/ic_launcher_foreground.png",
            size
        )
    
    print("\n✅ All icons generated successfully!")
    print("📱 Icons are ready for Android build!")

