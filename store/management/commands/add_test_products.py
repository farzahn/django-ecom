"""
Django management command to add test products for the pasargadprints e-commerce platform.
This command creates sample 3D printed products with placeholder images for testing purposes.
"""

import os
import requests
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from store.models import Product, ProductImage


class Command(BaseCommand):
    help = 'Add test products with placeholder images for development and testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=8,
            help='Number of test products to create (default: 8)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing products before adding new ones'
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing products...')
            Product.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing products cleared.'))

        count = options['count']
        self.stdout.write(f'Creating {count} test products...')

        # Test products data for 3D printed items
        test_products = [
            {
                'name': 'Modern Geometric Vase',
                'description': 'Contemporary geometric vase with clean lines and modern aesthetics. Perfect for fresh flowers or as a standalone decorative piece. 3D printed with eco-friendly PLA material in a variety of colors.',
                'price': Decimal('24.99'),
                'stock_quantity': 15,
                'length': Decimal('12.5'),
                'width': Decimal('12.5'),
                'height': Decimal('20.0'),
                'weight': Decimal('250.0'),
                'category': 'Home Decor',
                'images': [
                    'https://media.istockphoto.com/id/1146517111/photo/3d-render-of-luxury-home-interior.jpg?s=612x612&w=0&k=20&c=ykBSCGwcGzNkTrBNm3remRvm6_ZeJuXBFSaLBPkuE8M=',
                    'https://media.istockphoto.com/id/1200677760/photo/empty-room-with-parquet-floor-and-white-wall-background-3d-rendering.jpg?s=612x612&w=0&k=20&c=4TX1rQd8LYOuoC44PGOVayoRd5t3TZ9KGjD6SLKjGBU='
                ]
            },
            {
                'name': 'Adjustable Phone Stand',
                'description': 'Ergonomic phone stand with adjustable viewing angles. Features built-in cable management and non-slip base. Compatible with phones 4-7 inches. 3D printed for durability and precision.',
                'price': Decimal('12.99'),
                'stock_quantity': 25,
                'length': Decimal('8.0'),
                'width': Decimal('10.0'),
                'height': Decimal('6.5'),
                'weight': Decimal('85.0'),
                'category': 'Tech Accessories',
                'images': [
                    'https://media.istockphoto.com/id/1200026568/photo/smartphone-mockup-on-desk.jpg?s=612x612&w=0&k=20&c=Zn0lNHaW4AN3UNQZNrM4bTK_D6FPWaWF3qB1s5UXZzA=',
                ]
            },
            {
                'name': 'Minimalist Desk Organizer',
                'description': 'Multi-compartment desk organizer with slots for pens, paper clips, and small office supplies. Clean minimalist design that complements any workspace. Made with sustainable 3D printing materials.',
                'price': Decimal('18.99'),
                'stock_quantity': 20,
                'length': Decimal('15.0'),
                'width': Decimal('10.0'),
                'height': Decimal('4.0'),
                'weight': Decimal('120.0'),
                'category': 'Office Supplies',
                'images': [
                    'https://media.istockphoto.com/id/1148294132/photo/modern-office-desk-with-computer-and-supplies.jpg?s=612x612&w=0&k=20&c=6Qm2xU3k4d4z1X5k8c7j9L2p1c3v6b8n9Z0Qw5E4R8A=',
                ]
            },
            {
                'name': 'Custom Chess Set',
                'description': 'Beautifully designed chess set with modern artistic pieces. Each piece is meticulously 3D printed for perfect detail and balance. Includes wooden-style board pattern. Great for chess enthusiasts and collectors.',
                'price': Decimal('45.99'),
                'stock_quantity': 8,
                'length': Decimal('40.0'),
                'width': Decimal('40.0'),
                'height': Decimal('8.0'),
                'weight': Decimal('800.0'),
                'category': 'Games & Toys',
                'images': [
                    'https://media.istockphoto.com/id/1144729091/photo/chess-board-game.jpg?s=612x612&w=0&k=20&c=8t5N9v2d3f6h9j2k5L8o1P4Q7r0T3W6Y9z2C5F8I1L4=',
                ]
            },
            {
                'name': 'Designer Plant Pot',
                'description': 'Modern spiral-design plant pot perfect for succulents and small plants. Features drainage hole and matching saucer. Lightweight yet durable construction. Available in multiple colors.',
                'price': Decimal('16.99'),
                'stock_quantity': 30,
                'length': Decimal('12.0'),
                'width': Decimal('12.0'),
                'height': Decimal('11.0'),
                'weight': Decimal('180.0'),
                'category': 'Home & Garden',
                'images': [
                    'https://media.istockphoto.com/id/1125706482/photo/potted-plants-on-table.jpg?s=612x612&w=0&k=20&c=2k4f6h8j0L3n5p7r9T1v3X5z7C9F1I3K5N7Q9S1V3Y5=',
                ]
            },
            {
                'name': 'Wireless Charging Station',
                'description': 'Sleek wireless charging station with multiple device support. Designed for phones, earbuds, and smartwatches. LED indicator lights and cooling vents. 3D printed with precision for perfect fit.',
                'price': Decimal('32.99'),
                'stock_quantity': 12,
                'length': Decimal('20.0'),
                'width': Decimal('15.0'),
                'height': Decimal('8.0'),
                'weight': Decimal('300.0'),
                'category': 'Tech Accessories',
                'images': [
                    'https://media.istockphoto.com/id/1189344432/photo/wireless-charging-technology.jpg?s=612x612&w=0&k=20&c=4d6f8h0j2L4n6p8r0T2v4X6z8C0F2I4K6N8Q0S2V4Y6=',
                ]
            },
            {
                'name': 'Artistic Wall Hook Set',
                'description': 'Set of 4 modern wall hooks with geometric designs. Perfect for coats, bags, or decorative items. Strong mounting system included. Each hook supports up to 5kg. Contemporary home accent.',
                'price': Decimal('21.99'),
                'stock_quantity': 18,
                'length': Decimal('6.0'),
                'width': Decimal('8.0'),
                'height': Decimal('4.0'),
                'weight': Decimal('60.0'),
                'category': 'Home Decor',
                'images': [
                    'https://media.istockphoto.com/id/1158248435/photo/modern-wall-hooks.jpg?s=612x612&w=0&k=20&c=6g8h0j2L4n6p8r0T2v4X6z8C0F2I4K6N8Q0S2V4Y6z8=',
                ]
            },
            {
                'name': 'Cable Management Box',
                'description': 'Large cable management solution for hiding power strips and cables. Ventilated design prevents overheating. Multiple cable entry points. Keeps your workspace clean and organized.',
                'price': Decimal('28.99'),
                'stock_quantity': 14,
                'length': Decimal('25.0'),
                'width': Decimal('12.0'),
                'height': Decimal('10.0'),
                'weight': Decimal('220.0'),
                'category': 'Office Supplies',
                'images': [
                    'https://media.istockphoto.com/id/1142567123/photo/cable-management-solutions.jpg?s=612x612&w=0&k=20&c=8h0j2L4n6p8r0T2v4X6z8C0F2I4K6N8Q0S2V4Y6z8C0=',
                ]
            }
        ]

        created_count = 0
        for i, product_data in enumerate(test_products[:count]):
            if created_count >= count:
                break

            # Create product
            product = Product.objects.create(
                name=product_data['name'],
                description=product_data['description'],
                price=product_data['price'],
                stock_quantity=product_data['stock_quantity'],
                length=product_data['length'],
                width=product_data['width'],
                height=product_data['height'],
                weight=product_data['weight'],
                is_active=True
            )

            self.stdout.write(f'Created product: {product.name}')

            # Add placeholder images (using generic placeholder service for now)
            for idx, image_url in enumerate(product_data.get('images', [])):
                try:
                    # Create a placeholder image using a generic service
                    placeholder_url = f"https://picsum.photos/800/600?random={product.id}&sig={idx}"
                    
                    # For development, we'll create simple placeholder files
                    # In production, you would download from actual iStock URLs
                    image_content = self.create_placeholder_image_content(product.name, idx)
                    
                    product_image = ProductImage.objects.create(
                        product=product,
                        alt_text=f"{product.name} - View {idx + 1}",
                        is_primary=(idx == 0),
                        order=idx
                    )
                    
                    # Save the placeholder content as an image file
                    filename = f"{product.slug}_{idx + 1}.jpg"
                    product_image.image.save(
                        filename,
                        ContentFile(image_content),
                        save=True
                    )
                    
                    self.stdout.write(f'  Added image {idx + 1} for {product.name}')
                
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(f'Failed to add image for {product.name}: {str(e)}')
                    )

            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} test products!')
        )

    def create_placeholder_image_content(self, product_name, image_index):
        """
        Create a simple placeholder image content.
        In a real implementation, this would download from iStock.
        """
        try:
            from PIL import Image, ImageDraw, ImageFont
            import io

            # Create a simple colored rectangle as placeholder
            width, height = 800, 600
            colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9']
            color = colors[image_index % len(colors)]
            
            # Create image
            img = Image.new('RGB', (width, height), color=color)
            draw = ImageDraw.Draw(img)
            
            # Add text
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 40)
            except:
                font = ImageFont.load_default()
            
            text = f"{product_name}\nImage {image_index + 1}"
            text_bbox = draw.textbbox((0, 0), text, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]
            
            x = (width - text_width) // 2
            y = (height - text_height) // 2
            
            draw.text((x, y), text, fill='white', font=font)
            
            # Save to bytes
            img_io = io.BytesIO()
            img.save(img_io, format='JPEG', quality=85)
            img_io.seek(0)
            
            return img_io.read()
            
        except ImportError:
            # Fallback: create a minimal file if PIL is not available
            return b"Placeholder image content for " + product_name.encode('utf-8')