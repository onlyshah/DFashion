#!/usr/bin/env python3
"""
DFashion Simple Backend Server (Python)
No dependencies required - uses only Python standard library
"""

import http.server
import socketserver
import json
import urllib.parse
from datetime import datetime, timedelta
import threading
import webbrowser

# Mock data
users = [
    {
        "id": "1",
        "username": "fashionista_maya",
        "fullName": "Maya Sharma",
        "email": "maya@example.com",
        "avatar": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
        "role": "customer",
        "followers": ["2", "3"],
        "following": ["2", "4"],
        "socialStats": {"postsCount": 12, "followersCount": 1250, "followingCount": 890}
    },
    {
        "id": "2",
        "username": "style_guru_raj",
        "fullName": "Raj Patel",
        "email": "raj@example.com",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        "role": "vendor",
        "followers": ["1"],
        "following": ["3", "4"],
        "socialStats": {"postsCount": 45, "followersCount": 5600, "followingCount": 234}
    }
]

products = [
    {
        "id": "p1",
        "name": "Floral Maxi Dress",
        "price": 2499,
        "originalPrice": 3499,
        "discount": 29,
        "category": "women",
        "brand": "StyleCraft",
        "image": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500",
        "vendorId": "2",
        "views": 1250,
        "likes": 89,
        "purchases": 45
    },
    {
        "id": "p2",
        "name": "Classic White Shirt",
        "price": 1899,
        "originalPrice": 2299,
        "discount": 17,
        "category": "men",
        "brand": "StyleCraft",
        "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500",
        "vendorId": "2",
        "views": 2100,
        "likes": 156,
        "purchases": 78
    }
]

posts = [
    {
        "id": "post1",
        "userId": "1",
        "caption": "Loving this new floral dress! Perfect for the summer vibes 🌸 #SummerFashion #FloralDress #OOTD",
        "image": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600",
        "productTags": [{"productId": "p1", "x": 40, "y": 50}],
        "likes": [],
        "comments": [],
        "createdAt": (datetime.now() - timedelta(hours=2)).isoformat()
    },
    {
        "id": "post2",
        "userId": "2",
        "caption": "Perfect formal shirt for office meetings! Quality fabric and great fit 👔 #FormalWear #OfficeStyle",
        "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
        "productTags": [{"productId": "p2", "x": 50, "y": 50}],
        "likes": [],
        "comments": [],
        "createdAt": (datetime.now() - timedelta(hours=4)).isoformat()
    }
]

stories = [
    {
        "id": "story1",
        "userId": "1",
        "image": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400",
        "caption": "Perfect outfit for brunch! 🥐☕",
        "productTags": [{"productId": "p1", "x": 30, "y": 60}],
        "views": [],
        "likes": [],
        "expiresAt": (datetime.now() + timedelta(hours=24)).isoformat(),
        "createdAt": datetime.now().isoformat()
    }
]

class DFashionHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        self.send_cors_headers()
        
        if self.path == '/api/health':
            self.send_json_response({
                "status": "OK",
                "message": "DFashion Python Backend is running!",
                "timestamp": datetime.now().isoformat()
            })
        elif self.path == '/api/posts':
            self.handle_posts()
        elif self.path == '/api/stories':
            self.handle_stories()
        elif self.path == '/api/products':
            self.handle_products()
        elif self.path == '/api/products/trending':
            self.handle_trending_products()
        elif self.path == '/api/users':
            self.handle_users()
        else:
            self.send_json_response({"error": "Not found"}, 404)

    def do_POST(self):
        """Handle POST requests"""
        self.send_cors_headers()
        
        if '/api/posts/' in self.path and self.path.endswith('/like'):
            self.handle_like_post()
        else:
            self.send_json_response({"error": "Not found"}, 404)

    def send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def send_json_response(self, data, status_code=200):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def handle_posts(self):
        """Handle posts endpoint"""
        posts_with_data = []
        for post in posts:
            user = next((u for u in users if u["id"] == post["userId"]), None)
            products_data = []
            for tag in post["productTags"]:
                product = next((p for p in products if p["id"] == tag["productId"]), None)
                if product:
                    products_data.append({**tag, "product": product})
            
            posts_with_data.append({
                **post,
                "user": user,
                "products": products_data,
                "likesCount": len(post["likes"]),
                "commentsCount": len(post["comments"])
            })
        
        self.send_json_response({
            "posts": posts_with_data,
            "pagination": {"current": 1, "pages": 1, "total": len(posts_with_data)}
        })

    def handle_stories(self):
        """Handle stories endpoint"""
        active_stories = [s for s in stories if datetime.fromisoformat(s["expiresAt"]) > datetime.now()]
        story_groups = []
        for story in active_stories:
            user = next((u for u in users if u["id"] == story["userId"]), None)
            if user:
                story_groups.append({"user": user, "stories": [story]})
        
        self.send_json_response({"storyGroups": story_groups})

    def handle_products(self):
        """Handle products endpoint"""
        products_with_vendor = []
        for product in products:
            vendor = next((u for u in users if u["id"] == product["vendorId"]), None)
            products_with_vendor.append({**product, "vendor": vendor})
        
        self.send_json_response({"products": products_with_vendor})

    def handle_trending_products(self):
        """Handle trending products endpoint"""
        trending = sorted(products, key=lambda x: x["views"], reverse=True)[:3]
        trending_with_vendor = []
        for product in trending:
            vendor = next((u for u in users if u["id"] == product["vendorId"]), None)
            trending_with_vendor.append({**product, "vendor": vendor})
        
        self.send_json_response({"products": trending_with_vendor})

    def handle_users(self):
        """Handle users endpoint"""
        self.send_json_response({"users": users})

    def handle_like_post(self):
        """Handle like post endpoint"""
        post_id = self.path.split('/')[3]
        post = next((p for p in posts if p["id"] == post_id), None)
        
        if post:
            # Add a like (simplified)
            post["likes"].append({"userId": "1", "likedAt": datetime.now().isoformat()})
            self.send_json_response({"likesCount": len(post["likes"]), "isLiked": True})
        else:
            self.send_json_response({"error": "Post not found"}, 404)

def start_server():
    """Start the server"""
    PORT = 5000
    
    with socketserver.TCPServer(("", PORT), DFashionHandler) as httpd:
        print("========================================")
        print("🚀 DFashion Python Backend Server")
        print("========================================")
        print(f"📡 Server running on http://localhost:{PORT}")
        print("💾 Using local data (no database required)")
        print("🔗 CORS enabled for frontend connection")
        print("📱 API endpoints available:")
        print("   GET /api/health - Health check")
        print("   GET /api/posts - Get posts")
        print("   GET /api/stories - Get stories")
        print("   GET /api/products - Get products")
        print("   GET /api/users - Get users")
        print("========================================")
        print("✅ Ready to serve Angular frontend!")
        print("Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")

if __name__ == "__main__":
    start_server()
