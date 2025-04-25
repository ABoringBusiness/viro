#!/usr/bin/env python3
"""
API Server for Product Detection and Shopping Recommendation AI Agent

This module provides a Flask API server to expose the functionality of the
ProductDetectionAgent to ViroReact applications.
"""

import os
import sys
import json
import base64
import logging
from typing import Dict, Any

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from product_detection import ProductDetectionAgent, load_config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("ShoppingAgentAPI")

# Load configuration
config = load_config()

# Initialize agent
agent = ProductDetectionAgent(config)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok", "apis": agent.available_apis})

@app.route("/detect", methods=["POST"])
def detect_products():
    """
    Detect products in an image.
    
    Accepts either a file upload or a base64 encoded image.
    """
    try:
        options = request.form.to_dict() if request.form else {}
        
        # Check if image is uploaded as a file
        if "image" in request.files:
            file = request.files["image"]
            if file.filename == "":
                return jsonify({"error": "No file selected"}), 400
            
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(filepath)
            
            # Detect products
            products = agent.detect_products(filepath, options)
            
            # Clean up
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify({"products": products})
        
        # Check if image is provided as base64
        if "image_base64" in request.form:
            image_base64 = request.form["image_base64"]
            products = agent.detect_products(image_base64, options)
            return jsonify({"products": products})
        
        # Check if image is provided as JSON
        data = request.get_json(silent=True)
        if data and "image_base64" in data:
            image_base64 = data["image_base64"]
            options = data.get("options", {})
            products = agent.detect_products(image_base64, options)
            return jsonify({"products": products})
        
        return jsonify({"error": "No image provided"}), 400
    
    except Exception as e:
        logger.error(f"Error in detect_products: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/search", methods=["GET", "POST"])
def search_products():
    """
    Search for products on shopping platforms.
    """
    try:
        if request.method == "GET":
            query = request.args.get("query")
            if not query:
                return jsonify({"error": "No query provided"}), 400
            
            options = {
                "category": request.args.get("category"),
                "max_results": int(request.args.get("max_results", agent.settings["max_results"])),
            }
            
            if request.args.get("min_price") and request.args.get("max_price"):
                options["price_range"] = (
                    float(request.args.get("min_price")),
                    float(request.args.get("max_price"))
                )
            
            results = agent.search_products(query, options)
            return jsonify({"results": results})
        
        else:  # POST
            data = request.get_json()
            if not data or "query" not in data:
                return jsonify({"error": "No query provided"}), 400
            
            query = data["query"]
            options = data.get("options", {})
            
            results = agent.search_products(query, options)
            return jsonify({"results": results})
    
    except Exception as e:
        logger.error(f"Error in search_products: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/track", methods=["POST"])
def track_price():
    """
    Set up price tracking for a product.
    """
    try:
        data = request.get_json()
        if not data or "product_id" not in data or "platform" not in data:
            return jsonify({"error": "Product ID and platform are required"}), 400
        
        product_id = data["product_id"]
        platform = data["platform"]
        options = data.get("options", {})
        
        tracking_info = agent.track_price(product_id, platform, options)
        return jsonify(tracking_info)
    
    except Exception as e:
        logger.error(f"Error in track_price: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/history", methods=["GET"])
def get_price_history():
    """
    Get price history for a product.
    """
    try:
        product_id = request.args.get("product_id")
        platform = request.args.get("platform")
        
        if not product_id or not platform:
            return jsonify({"error": "Product ID and platform are required"}), 400
        
        options = {
            "days": int(request.args.get("days", 30))
        }
        
        history = agent.get_price_history(product_id, platform, options)
        return jsonify(history)
    
    except Exception as e:
        logger.error(f"Error in get_price_history: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/similar", methods=["GET"])
def find_similar_products():
    """
    Find similar products to a given product.
    """
    try:
        product_id = request.args.get("product_id")
        platform = request.args.get("platform")
        
        if not product_id or not platform:
            return jsonify({"error": "Product ID and platform are required"}), 400
        
        options = {
            "max_results": int(request.args.get("max_results", agent.settings["max_results"]))
        }
        
        similar_products = agent.find_similar_products(product_id, platform, options)
        return jsonify({"similar_products": similar_products})
    
    except Exception as e:
        logger.error(f"Error in find_similar_products: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/best-deal", methods=["GET"])
def find_best_deal():
    """
    Find the best deal for a product across multiple platforms.
    """
    try:
        product_name = request.args.get("product_name")
        
        if not product_name:
            return jsonify({"error": "Product name is required"}), 400
        
        options = {
            "max_results_per_platform": int(request.args.get("max_results_per_platform", 3))
        }
        
        best_deal = agent.find_best_deal(product_name, options)
        return jsonify(best_deal)
    
    except Exception as e:
        logger.error(f"Error in find_best_deal: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/buying-options", methods=["GET"])
def get_buying_options():
    """
    Get buying options for a product.
    """
    try:
        product_name = request.args.get("product_name")
        
        if not product_name:
            return jsonify({"error": "Product name is required"}), 400
        
        options = {}
        
        buying_options = agent.get_buying_options(product_name, options)
        return jsonify(buying_options)
    
    except Exception as e:
        logger.error(f"Error in get_buying_options: {e}")
        return jsonify({"error": str(e)}), 500

def main():
    """Main function to run the API server."""
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

if __name__ == "__main__":
    main()