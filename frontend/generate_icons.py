#!/usr/bin/env python3
"""
Script pour générer les icônes PWA pour AgriGenius
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Créer le dossier icons s'il n'existe pas
os.makedirs("public/icons", exist_ok=True)

# Tailles d'icônes PWA requises
sizes = [72, 96, 128, 144, 152, 192, 384, 512]

def create_icon(size):
    """Crée une icône AgriGenius avec un logo simple"""

    # Créer une image avec fond vert
    img = Image.new('RGB', (size, size), color='#22c55e')
    draw = ImageDraw.Draw(img)

    # Calculer les dimensions
    padding = size // 8
    inner_size = size - (padding * 2)

    # Dessiner un cercle blanc au centre
    circle_bbox = [padding, padding, size - padding, size - padding]
    draw.ellipse(circle_bbox, fill='white')

    # Dessiner une feuille stylisée (symbole agricole)
    # Feuille gauche
    leaf_padding = size // 4
    leaf_points = [
        (size // 2, size // 2),  # Centre
        (leaf_padding, leaf_padding),  # Haut gauche
        (leaf_padding + size // 10, size // 2 - size // 10),  # Point intermédiaire
    ]
    draw.polygon(leaf_points, fill='#22c55e')

    # Feuille droite
    leaf_points_right = [
        (size // 2, size // 2),  # Centre
        (size - leaf_padding, leaf_padding),  # Haut droit
        (size - leaf_padding - size // 10, size // 2 - size // 10),  # Point intermédiaire
    ]
    draw.polygon(leaf_points_right, fill='#22c55e')

    # Tige centrale
    stem_width = max(2, size // 40)
    stem_x = size // 2 - stem_width // 2
    draw.rectangle([stem_x, size // 2, stem_x + stem_width, size - leaf_padding], fill='#16a34a')

    # Ajouter les initiales "AG" si l'icône est assez grande
    if size >= 192:
        try:
            # Utiliser une police par défaut
            font_size = size // 6
            # Tenter de charger une police système
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                try:
                    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
                except:
                    font = ImageFont.load_default()

            text = "AG"
            # Centrer le texte en bas
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            text_x = (size - text_width) // 2
            text_y = size - leaf_padding - text_height - padding // 2

            # Ombre du texte
            draw.text((text_x + 2, text_y + 2), text, fill='#166534', font=font)
            # Texte principal
            draw.text((text_x, text_y), text, fill='white', font=font)
        except Exception as e:
            print(f"Impossible d'ajouter le texte: {e}")

    # Sauvegarder l'icône
    output_path = f"public/icons/icon-{size}x{size}.png"
    img.save(output_path, 'PNG')
    print(f"[OK] Icone creee: {output_path}")

# Générer toutes les icônes
print("Generation des icones PWA pour AgriGenius...")
for size in sizes:
    create_icon(size)

# Créer également les icônes de raccourcis
print("\nGeneration des icones de raccourcis...")

def create_shortcut_icon(name, color, symbol):
    """Crée une icône de raccourci"""
    size = 96
    img = Image.new('RGB', (size, size), color=color)
    draw = ImageDraw.Draw(img)

    # Dessiner un cercle blanc au centre
    padding = size // 6
    circle_bbox = [padding, padding, size - padding, size - padding]
    draw.ellipse(circle_bbox, fill='white')

    # Ajouter le symbole (simplifié)
    inner_padding = size // 3
    if symbol == "diagnostic":
        # Croix médicale
        draw.rectangle([size // 2 - 4, inner_padding, size // 2 + 4, size - inner_padding], fill=color)
        draw.rectangle([inner_padding, size // 2 - 4, size - inner_padding, size // 2 + 4], fill=color)
    elif symbol == "formation":
        # Livre
        draw.rectangle([inner_padding, inner_padding, size - inner_padding, size - inner_padding], fill=color)
        draw.rectangle([inner_padding + 8, inner_padding, inner_padding + 10, size - inner_padding], fill='white')
    elif symbol == "marketplace":
        # Panier
        draw.rectangle([inner_padding, size // 2, size - inner_padding, size - inner_padding], fill=color)

    output_path = f"public/icons/shortcut-{name}.png"
    img.save(output_path, 'PNG')
    print(f"[OK] Icone de raccourci creee: {output_path}")

create_shortcut_icon("diagnostic", "#ef4444", "diagnostic")
create_shortcut_icon("formation", "#3b82f6", "formation")
create_shortcut_icon("marketplace", "#f59e0b", "marketplace")

print("\n[OK] Toutes les icones ont ete generees avec succes!")
print("\nNote: Vous pouvez remplacer ces icones par des designs personnalises")
print("   en utilisant un outil de design comme Figma, Canva ou Adobe Illustrator.")
