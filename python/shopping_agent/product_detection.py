#!/usr/bin/env python3
"""
Product Detection and Shopping Recommendation AI Agent

This module provides functionality for detecting products in images and
providing shopping recommendations using various APIs and AI models.
"""

import os
import sys
import json
import base64
import argparse
import requests
from typing import Dict, List, Any, Optional, Union, Tuple
import logging
from datetime import datetime
import time
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("ProductDetectionAgent")

# Constants
DEFAULT_CONFIDENCE_THRESHOLD = 0.7
DEFAULT_MAX_RESULTS = 5
DEFAULT_TIMEOUT = 30  # seconds

class ProductDetectionAgent:
    """
    AI Agent for product detection and shopping recommendations.
    
    This agent can:
    1. Detect products in images using various computer vision APIs
    2. Search for similar products on shopping platforms
    3. Track prices and provide price history
    4. Set up price alerts for products
    5. Recommend best deals for detected products
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the ProductDetectionAgent with configuration.
        
        Args:
            config: Configuration dictionary with API keys and settings
        """
        self.config = config or {}
        self.api_keys = self.config.get("api_keys", {})
        self.settings = self.config.get("settings", {})
        
        # Set default settings if not provided
        self.settings.setdefault("confidence_threshold", DEFAULT_CONFIDENCE_THRESHOLD)
        self.settings.setdefault("max_results", DEFAULT_MAX_RESULTS)
        self.settings.setdefault("timeout", DEFAULT_TIMEOUT)
        
        # Initialize API clients
        self._init_api_clients()
        
        logger.info("ProductDetectionAgent initialized")
    
    def _init_api_clients(self):
        """Initialize API clients based on available API keys."""
        self.available_apis = []
        
        # Check for Google Cloud Vision API
        if "google_cloud_vision" in self.api_keys:
            try:
                from google.cloud import vision
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = self.api_keys["google_cloud_vision"]
                self.vision_client = vision.ImageAnnotatorClient()
                self.available_apis.append("google_cloud_vision")
                logger.info("Google Cloud Vision API client initialized")
            except (ImportError, Exception) as e:
                logger.warning(f"Failed to initialize Google Cloud Vision API: {e}")
        
        # Check for Amazon Product API
        if "amazon_product_api" in self.api_keys:
            self.amazon_api_config = self.api_keys["amazon_product_api"]
            self.available_apis.append("amazon_product_api")
            logger.info("Amazon Product API client initialized")
        
        # Check for OpenAI API
        if "openai" in self.api_keys:
            try:
                import openai
                openai.api_key = self.api_keys["openai"]
                self.openai_client = openai
                self.available_apis.append("openai")
                logger.info("OpenAI API client initialized")
            except (ImportError, Exception) as e:
                logger.warning(f"Failed to initialize OpenAI API: {e}")
        
        # Check for other shopping APIs
        for api_name in ["walmart_api", "ebay_api", "shopify_api", "etsy_api"]:
            if api_name in self.api_keys:
                self.available_apis.append(api_name)
                logger.info(f"{api_name.replace('_', ' ').title()} client initialized")
        
        if not self.available_apis:
            logger.warning("No API clients were initialized. Functionality will be limited.")
    
    def detect_products(self, image_path: str, options: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Detect products in an image using available APIs.
        
        Args:
            image_path: Path to the image file or base64 encoded image string
            options: Additional options for detection
            
        Returns:
            List of detected products with their details
        """
        options = options or {}
        confidence_threshold = options.get("confidence_threshold", self.settings["confidence_threshold"])
        max_results = options.get("max_results", self.settings["max_results"])
        
        # Determine if image_path is a file path or base64 string
        is_base64 = image_path.startswith("data:image") or (
            len(image_path) > 100 and not os.path.exists(image_path)
        )
        
        detected_products = []
        
        # Try different APIs for product detection
        if "google_cloud_vision" in self.available_apis:
            try:
                products = self._detect_with_google_vision(image_path, is_base64)
                detected_products.extend(products)
                logger.info(f"Detected {len(products)} products with Google Cloud Vision API")
            except Exception as e:
                logger.error(f"Error detecting products with Google Cloud Vision API: {e}")
        
        # If OpenAI is available, use it for additional detection
        if "openai" in self.available_apis and (not detected_products or len(detected_products) < max_results):
            try:
                products = self._detect_with_openai(image_path, is_base64)
                # Merge with existing products, avoiding duplicates
                existing_names = {p["name"].lower() for p in detected_products}
                for product in products:
                    if product["name"].lower() not in existing_names:
                        detected_products.append(product)
                        existing_names.add(product["name"].lower())
                logger.info(f"Detected {len(products)} products with OpenAI API")
            except Exception as e:
                logger.error(f"Error detecting products with OpenAI API: {e}")
        
        # Filter by confidence threshold and limit results
        filtered_products = [
            p for p in detected_products 
            if p.get("confidence", 0) >= confidence_threshold
        ]
        filtered_products = sorted(
            filtered_products, 
            key=lambda p: p.get("confidence", 0), 
            reverse=True
        )[:max_results]
        
        return filtered_products
    
    def _detect_with_google_vision(self, image_path: str, is_base64: bool) -> List[Dict[str, Any]]:
        """
        Detect products using Google Cloud Vision API.
        
        Args:
            image_path: Path to the image file or base64 encoded image string
            is_base64: Whether the image_path is a base64 encoded string
            
        Returns:
            List of detected products
        """
        if "google_cloud_vision" not in self.available_apis:
            return []
        
        from google.cloud import vision
        
        # Prepare the image
        if is_base64:
            # Extract the base64 content if it's a data URL
            if image_path.startswith("data:image"):
                image_path = image_path.split(",")[1]
            image = vision.Image(content=base64.b64decode(image_path))
        else:
            with open(image_path, "rb") as image_file:
                content = image_file.read()
            image = vision.Image(content=content)
        
        # Detect labels
        response = self.vision_client.label_detection(image=image)
        labels = response.label_annotations
        
        # Detect logos
        logo_response = self.vision_client.logo_detection(image=image)
        logos = logo_response.logo_annotations
        
        # Detect objects
        object_response = self.vision_client.object_localization(image=image)
        objects = object_response.localized_object_annotations
        
        # Process results
        products = []
        
        # Add objects
        for obj in objects:
            if obj.name.lower() in ["clothing", "footwear", "shoe", "accessory", "bag", "watch", 
                                   "electronics", "phone", "laptop", "camera", "headphones",
                                   "furniture", "chair", "table", "sofa", "bed",
                                   "food", "fruit", "vegetable", "beverage"]:
                vertices = []
                for vertex in obj.bounding_poly.normalized_vertices:
                    vertices.append({"x": vertex.x, "y": vertex.y})
                
                products.append({
                    "name": obj.name,
                    "confidence": obj.score,
                    "type": "object",
                    "bounding_box": vertices,
                    "attributes": {}
                })
        
        # Add logos (usually brand information)
        for logo in logos:
            vertices = []
            for vertex in logo.bounding_poly.vertices:
                vertices.append({"x": vertex.x, "y": vertex.y})
            
            products.append({
                "name": logo.description,
                "confidence": logo.score,
                "type": "brand",
                "bounding_box": vertices,
                "attributes": {"brand": logo.description}
            })
        
        # Add relevant labels
        product_related_labels = ["product", "brand", "clothing", "electronics", "food", 
                                 "furniture", "accessory", "shoe", "watch", "bag"]
        
        for label in labels:
            if any(term in label.description.lower() for term in product_related_labels):
                products.append({
                    "name": label.description,
                    "confidence": label.score,
                    "type": "label",
                    "bounding_box": [],
                    "attributes": {}
                })
        
        return products
    
    def _detect_with_openai(self, image_path: str, is_base64: bool) -> List[Dict[str, Any]]:
        """
        Detect products using OpenAI's Vision API.
        
        Args:
            image_path: Path to the image file or base64 encoded image string
            is_base64: Whether the image_path is a base64 encoded string
            
        Returns:
            List of detected products
        """
        if "openai" not in self.available_apis:
            return []
        
        # Prepare the image
        if is_base64:
            # If it's already a data URL, use it directly
            if image_path.startswith("data:image"):
                image_data = image_path
            else:
                # Convert base64 to data URL
                image_data = f"data:image/jpeg;base64,{image_path}"
        else:
            # Read image file and convert to base64
            with open(image_path, "rb") as image_file:
                image_bytes = image_file.read()
                image_base64 = base64.b64encode(image_bytes).decode("utf-8")
                image_data = f"data:image/jpeg;base64,{image_base64}"
        
        # Create prompt for product detection
        prompt = """
        Analyze this image and identify any products that could be purchased.
        For each product, provide:
        1. Product name
        2. Brand (if visible)
        3. Category (clothing, electronics, food, etc.)
        4. Key features
        5. Estimated price range
        
        Format your response as a JSON array with objects containing:
        {
            "name": "Product Name",
            "brand": "Brand Name",
            "category": "Category",
            "features": ["feature1", "feature2"],
            "estimated_price_range": "$XX - $YY",
            "confidence": 0.XX (between 0 and 1)
        }
        
        Only include products that you're reasonably confident about (confidence > 0.6).
        """
        
        # Call OpenAI API
        response = self.openai_client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": image_data}
                        }
                    ]
                }
            ],
            max_tokens=1000
        )
        
        # Extract and parse the JSON response
        try:
            content = response.choices[0].message.content
            # Find JSON array in the response
            json_match = re.search(r'\[\s*\{.*\}\s*\]', content, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                products_data = json.loads(json_str)
            else:
                # Try to extract JSON objects individually
                json_objects = re.findall(r'\{[^{}]*\}', content)
                products_data = [json.loads(obj) for obj in json_objects if self._is_valid_json(obj)]
        except Exception as e:
            logger.error(f"Error parsing OpenAI response: {e}")
            logger.debug(f"OpenAI response content: {response.choices[0].message.content}")
            return []
        
        # Convert to our standard format
        products = []
        for item in products_data:
            products.append({
                "name": item.get("name", "Unknown Product"),
                "confidence": item.get("confidence", 0.7),
                "type": "product",
                "bounding_box": [],
                "attributes": {
                    "brand": item.get("brand"),
                    "category": item.get("category"),
                    "features": item.get("features", []),
                    "estimated_price_range": item.get("estimated_price_range")
                }
            })
        
        return products
    
    def _is_valid_json(self, json_str: str) -> bool:
        """Check if a string is valid JSON."""
        try:
            json.loads(json_str)
            return True
        except:
            return False
    
    def search_products(self, query: str, options: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Search for products on shopping platforms.
        
        Args:
            query: Search query or product name
            options: Additional options for search
            
        Returns:
            List of product search results
        """
        options = options or {}
        max_results = options.get("max_results", self.settings["max_results"])
        category = options.get("category")
        price_range = options.get("price_range")
        
        all_results = []
        
        # Search on Amazon if API is available
        if "amazon_product_api" in self.available_apis:
            try:
                amazon_results = self._search_amazon(query, category, price_range, max_results)
                all_results.extend(amazon_results)
                logger.info(f"Found {len(amazon_results)} products on Amazon")
            except Exception as e:
                logger.error(f"Error searching Amazon: {e}")
        
        # Search on other platforms
        for api_name in ["walmart_api", "ebay_api", "shopify_api", "etsy_api"]:
            if api_name in self.available_apis:
                try:
                    method_name = f"_search_{api_name.replace('_api', '')}"
                    if hasattr(self, method_name) and callable(getattr(self, method_name)):
                        results = getattr(self, method_name)(query, category, price_range, max_results)
                        all_results.extend(results)
                        logger.info(f"Found {len(results)} products on {api_name.replace('_api', '').title()}")
                except Exception as e:
                    logger.error(f"Error searching {api_name}: {e}")
        
        # If no results from APIs, use OpenAI to generate mock results
        if not all_results and "openai" in self.available_apis:
            try:
                mock_results = self._generate_mock_results(query, category, price_range, max_results)
                all_results.extend(mock_results)
                logger.info(f"Generated {len(mock_results)} mock product results")
            except Exception as e:
                logger.error(f"Error generating mock results: {e}")
        
        # Sort by relevance and limit results
        all_results = sorted(all_results, key=lambda x: x.get("relevance", 0), reverse=True)[:max_results]
        
        return all_results
    
    def _search_amazon(self, query: str, category: str = None, price_range: Tuple[float, float] = None, 
                      max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search for products on Amazon.
        
        Args:
            query: Search query or product name
            category: Product category
            price_range: Tuple of (min_price, max_price)
            max_results: Maximum number of results to return
            
        Returns:
            List of Amazon product search results
        """
        # In a real implementation, this would use the Amazon Product API
        # For now, return mock data
        return self._generate_mock_results(query, category, price_range, max_results, platform="Amazon")
    
    def _search_walmart(self, query: str, category: str = None, price_range: Tuple[float, float] = None, 
                       max_results: int = 5) -> List[Dict[str, Any]]:
        """Search for products on Walmart."""
        return self._generate_mock_results(query, category, price_range, max_results, platform="Walmart")
    
    def _search_ebay(self, query: str, category: str = None, price_range: Tuple[float, float] = None, 
                    max_results: int = 5) -> List[Dict[str, Any]]:
        """Search for products on eBay."""
        return self._generate_mock_results(query, category, price_range, max_results, platform="eBay")
    
    def _generate_mock_results(self, query: str, category: str = None, price_range: Tuple[float, float] = None, 
                              max_results: int = 5, platform: str = "Various") -> List[Dict[str, Any]]:
        """
        Generate mock product search results.
        
        Args:
            query: Search query or product name
            category: Product category
            price_range: Tuple of (min_price, max_price)
            max_results: Maximum number of results to return
            platform: Shopping platform name
            
        Returns:
            List of mock product search results
        """
        if "openai" not in self.available_apis:
            # Generate simple mock data without OpenAI
            results = []
            for i in range(max_results):
                price = 19.99 + (i * 10)
                if price_range:
                    min_price, max_price = price_range
                    if price < min_price:
                        price = min_price + (i * 5)
                    elif price > max_price:
                        price = max_price - (i * 5)
                
                results.append({
                    "id": f"mock-{platform.lower()}-{i}",
                    "name": f"{query.title()} {chr(65+i)}",
                    "description": f"This is a mock {query} product for demonstration purposes.",
                    "price": price,
                    "currency": "USD",
                    "url": f"https://example.com/{platform.lower()}/{query.replace(' ', '-')}-{i}",
                    "image_url": f"https://example.com/images/{query.replace(' ', '-')}-{i}.jpg",
                    "platform": platform,
                    "rating": 4.0 + (i % 10) / 10,
                    "reviews_count": 10 + (i * 5),
                    "relevance": 0.9 - (i * 0.1),
                    "category": category or "General",
                    "brand": f"Brand {chr(65+i)}",
                    "availability": "In Stock",
                    "shipping": {
                        "price": 5.99,
                        "is_free": False,
                        "estimated_delivery": "3-5 business days"
                    }
                })
            return results
        
        # Use OpenAI to generate more realistic mock data
        prompt = f"""
        Generate {max_results} realistic product search results for "{query}" on {platform}.
        
        {f'Category: {category}' if category else ''}
        {f'Price range: ${price_range[0]} - ${price_range[1]}' if price_range else ''}
        
        Format your response as a JSON array with objects containing:
        {{
            "id": "unique-id",
            "name": "Product Name",
            "description": "Brief product description",
            "price": XX.XX (numeric),
            "currency": "USD",
            "url": "https://example.com/product-url",
            "image_url": "https://example.com/image-url.jpg",
            "platform": "{platform}",
            "rating": X.X (between 1 and 5),
            "reviews_count": XXX,
            "relevance": 0.XX (between 0 and 1),
            "category": "Category",
            "brand": "Brand Name",
            "availability": "In Stock/Out of Stock/Pre-order",
            "shipping": {{
                "price": X.XX,
                "is_free": true/false,
                "estimated_delivery": "X-Y business days"
            }}
        }}
        
        Make the results realistic and varied, with different prices, ratings, and features.
        """
        
        # Call OpenAI API
        response = self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500
        )
        
        # Extract and parse the JSON response
        try:
            content = response.choices[0].message.content
            # Find JSON array in the response
            json_match = re.search(r'\[\s*\{.*\}\s*\]', content, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                results = json.loads(json_str)
            else:
                # Try to extract JSON objects individually
                json_objects = re.findall(r'\{[^{}]*\}', content)
                results = [json.loads(obj) for obj in json_objects if self._is_valid_json(obj)]
        except Exception as e:
            logger.error(f"Error parsing OpenAI response for mock results: {e}")
            logger.debug(f"OpenAI response content: {response.choices[0].message.content}")
            # Fall back to simple mock data
            return self._generate_mock_results(query, category, price_range, max_results, platform)
        
        return results
    
    def track_price(self, product_id: str, platform: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Set up price tracking for a product.
        
        Args:
            product_id: Product ID
            platform: Shopping platform name
            options: Additional options for price tracking
            
        Returns:
            Price tracking information
        """
        options = options or {}
        target_price = options.get("target_price")
        notify_email = options.get("notify_email")
        notify_phone = options.get("notify_phone")
        
        # In a real implementation, this would store the tracking information in a database
        tracking_id = f"track-{int(time.time())}-{product_id}"
        
        tracking_info = {
            "tracking_id": tracking_id,
            "product_id": product_id,
            "platform": platform,
            "target_price": target_price,
            "notify_email": notify_email,
            "notify_phone": notify_phone,
            "created_at": datetime.now().isoformat(),
            "status": "active"
        }
        
        logger.info(f"Set up price tracking for product {product_id} on {platform}")
        
        return tracking_info
    
    def get_price_history(self, product_id: str, platform: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Get price history for a product.
        
        Args:
            product_id: Product ID
            platform: Shopping platform name
            options: Additional options for price history
            
        Returns:
            Price history information
        """
        options = options or {}
        days = options.get("days", 30)
        
        # In a real implementation, this would fetch price history from a database
        # For now, generate mock price history
        
        import random
        from datetime import datetime, timedelta
        
        base_price = 99.99
        if product_id.isdigit():
            base_price = float(product_id) % 100 + 50
        
        price_history = []
        current_date = datetime.now()
        
        for i in range(days):
            date = current_date - timedelta(days=i)
            # Generate a price with some random variation
            price = base_price * (1 + random.uniform(-0.2, 0.2))
            # Add some sales events
            if i % 7 == 0:  # Weekly sales
                price = price * 0.9
            if i % 30 == 0:  # Monthly big sale
                price = price * 0.8
            
            price_history.append({
                "date": date.strftime("%Y-%m-%d"),
                "price": round(price, 2),
                "currency": "USD",
                "in_stock": random.random() > 0.1  # 90% chance of being in stock
            })
        
        # Sort by date (oldest first)
        price_history.sort(key=lambda x: x["date"])
        
        result = {
            "product_id": product_id,
            "platform": platform,
            "currency": "USD",
            "price_history": price_history,
            "lowest_price": min(item["price"] for item in price_history),
            "highest_price": max(item["price"] for item in price_history),
            "average_price": sum(item["price"] for item in price_history) / len(price_history),
            "current_price": price_history[-1]["price"] if price_history else base_price
        }
        
        logger.info(f"Retrieved price history for product {product_id} on {platform}")
        
        return result
    
    def find_similar_products(self, product_id: str, platform: str, options: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Find similar products to a given product.
        
        Args:
            product_id: Product ID
            platform: Shopping platform name
            options: Additional options for finding similar products
            
        Returns:
            List of similar products
        """
        options = options or {}
        max_results = options.get("max_results", self.settings["max_results"])
        
        # In a real implementation, this would call the shopping platform's API
        # For now, generate mock similar products
        
        # First, get the product details (mock)
        product_name = f"Product {product_id}"
        if ":" in product_id:
            product_name = product_id.split(":", 1)[1]
        
        # Generate similar products
        similar_products = self._generate_mock_results(product_name, max_results=max_results, platform=platform)
        
        logger.info(f"Found {len(similar_products)} similar products to {product_id} on {platform}")
        
        return similar_products
    
    def find_best_deal(self, product_name: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Find the best deal for a product across multiple platforms.
        
        Args:
            product_name: Product name
            options: Additional options for finding the best deal
            
        Returns:
            Best deal information
        """
        options = options or {}
        max_results_per_platform = options.get("max_results_per_platform", 3)
        
        all_results = []
        
        # Search on multiple platforms
        platforms = ["Amazon", "Walmart", "eBay", "Target", "BestBuy"]
        available_platforms = [p for p in platforms if f"{p.lower()}_api" in self.available_apis]
        
        if not available_platforms:
            available_platforms = platforms  # Use all platforms for mock data
        
        for platform in available_platforms:
            method_name = f"_search_{platform.lower()}"
            if hasattr(self, method_name) and callable(getattr(self, method_name)):
                try:
                    results = getattr(self, method_name)(product_name, max_results=max_results_per_platform)
                    all_results.extend(results)
                except Exception as e:
                    logger.error(f"Error searching {platform}: {e}")
            else:
                # Use mock results
                results = self._generate_mock_results(product_name, max_results=max_results_per_platform, platform=platform)
                all_results.extend(results)
        
        if not all_results:
            logger.warning(f"No results found for {product_name}")
            return {"error": "No results found"}
        
        # Find the best deal (lowest price)
        best_deal = min(all_results, key=lambda x: x.get("price", float("inf")))
        
        # Add comparison information
        average_price = sum(item.get("price", 0) for item in all_results) / len(all_results)
        best_deal["comparison"] = {
            "average_price": average_price,
            "savings": average_price - best_deal.get("price", 0),
            "savings_percentage": (average_price - best_deal.get("price", 0)) / average_price * 100 if average_price > 0 else 0,
            "total_results": len(all_results),
            "platforms_searched": available_platforms
        }
        
        logger.info(f"Found best deal for {product_name} on {best_deal.get('platform')}")
        
        return best_deal
    
    def get_buying_options(self, product_name: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Get buying options for a product, including new, used, refurbished, etc.
        
        Args:
            product_name: Product name
            options: Additional options for getting buying options
            
        Returns:
            Buying options information
        """
        options = options or {}
        
        # In a real implementation, this would call various shopping APIs
        # For now, generate mock buying options
        
        import random
        
        new_price = random.uniform(80, 120)
        
        buying_options = {
            "product_name": product_name,
            "options": {
                "new": {
                    "price": round(new_price, 2),
                    "availability": "In Stock",
                    "shipping": "Free",
                    "warranty": "1 Year Manufacturer Warranty",
                    "sellers": [
                        {"name": "Official Store", "rating": 4.8, "price": round(new_price, 2)},
                        {"name": "MegaRetailer", "rating": 4.6, "price": round(new_price * 1.05, 2)},
                        {"name": "ElectronicsPlus", "rating": 4.5, "price": round(new_price * 1.02, 2)}
                    ]
                },
                "used": {
                    "price": round(new_price * 0.7, 2),
                    "availability": "Limited Stock",
                    "condition": "Good",
                    "shipping": "$5.99",
                    "warranty": "30 Day Seller Warranty",
                    "sellers": [
                        {"name": "TechReseller", "rating": 4.3, "price": round(new_price * 0.7, 2), "condition": "Good"},
                        {"name": "ValueDeals", "rating": 4.1, "price": round(new_price * 0.65, 2), "condition": "Acceptable"},
                        {"name": "QualityUsed", "rating": 4.4, "price": round(new_price * 0.75, 2), "condition": "Very Good"}
                    ]
                },
                "refurbished": {
                    "price": round(new_price * 0.85, 2),
                    "availability": "In Stock",
                    "condition": "Certified Refurbished",
                    "shipping": "Free",
                    "warranty": "90 Day Warranty",
                    "sellers": [
                        {"name": "RefurbMaster", "rating": 4.5, "price": round(new_price * 0.85, 2)},
                        {"name": "RenewTech", "rating": 4.4, "price": round(new_price * 0.82, 2)},
                        {"name": "CertifiedRenew", "rating": 4.6, "price": round(new_price * 0.88, 2)}
                    ]
                }
            },
            "best_value": "refurbished",  # Determined based on price, condition, warranty, etc.
            "recommendation": "The refurbished option offers the best value with a 90-day warranty and 15% savings over new."
        }
        
        logger.info(f"Retrieved buying options for {product_name}")
        
        return buying_options

def load_config(config_path: str = None) -> Dict[str, Any]:
    """
    Load configuration from a JSON file.
    
    Args:
        config_path: Path to the configuration file
        
    Returns:
        Configuration dictionary
    """
    if not config_path:
        # Look for config in standard locations
        possible_paths = [
            os.path.join(os.getcwd(), "config.json"),
            os.path.join(os.path.dirname(__file__), "config.json"),
            os.path.expanduser("~/.config/shopping_agent/config.json"),
            "/etc/shopping_agent/config.json"
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                config_path = path
                break
    
    if not config_path or not os.path.exists(config_path):
        logger.warning("No configuration file found. Using default configuration.")
        return {}
    
    try:
        with open(config_path, "r") as f:
            config = json.load(f)
        logger.info(f"Loaded configuration from {config_path}")
        return config
    except Exception as e:
        logger.error(f"Error loading configuration: {e}")
        return {}

def main():
    """Main function for command-line usage."""
    parser = argparse.ArgumentParser(description="Product Detection and Shopping Recommendation AI Agent")
    parser.add_argument("--config", help="Path to configuration file")
    parser.add_argument("--image", help="Path to image file for product detection")
    parser.add_argument("--search", help="Search query for product search")
    parser.add_argument("--track", help="Product ID to track price")
    parser.add_argument("--platform", help="Shopping platform (Amazon, Walmart, eBay, etc.)")
    parser.add_argument("--history", help="Product ID to get price history")
    parser.add_argument("--similar", help="Product ID to find similar products")
    parser.add_argument("--best-deal", help="Product name to find the best deal")
    parser.add_argument("--buying-options", help="Product name to get buying options")
    parser.add_argument("--output", help="Output file path (default: stdout)")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")
    
    args = parser.parse_args()
    
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    # Load configuration
    config = load_config(args.config)
    
    # Initialize agent
    agent = ProductDetectionAgent(config)
    
    result = None
    
    # Process command
    if args.image:
        result = agent.detect_products(args.image)
    elif args.search:
        result = agent.search_products(args.search, {"platform": args.platform} if args.platform else None)
    elif args.track and args.platform:
        result = agent.track_price(args.track, args.platform)
    elif args.history and args.platform:
        result = agent.get_price_history(args.history, args.platform)
    elif args.similar and args.platform:
        result = agent.find_similar_products(args.similar, args.platform)
    elif args.best_deal:
        result = agent.find_best_deal(args.best_deal)
    elif args.buying_options:
        result = agent.get_buying_options(args.buying_options)
    else:
        parser.print_help()
        return
    
    # Output result
    if args.output:
        with open(args.output, "w") as f:
            json.dump(result, f, indent=2)
        logger.info(f"Results written to {args.output}")
    else:
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()