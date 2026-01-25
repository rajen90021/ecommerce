import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../features/home/models/cart_model.dart';
import '../../features/home/models/product_model.dart';

class CartProvider extends ChangeNotifier {
  List<CartItem> _items = [];
  final String _storageKey = 'user_cart';
  
  String? _appliedCoupon;
  double _couponDiscount = 0.0;
  final double _shippingFee = 99.0;

  CartProvider() {
    _loadFromPrefs();
  }

  List<CartItem> get items => _items;
  String? get appliedCoupon => _appliedCoupon;
  double get couponDiscount => _couponDiscount;
  double get shippingFee => subTotal > 999 ? 0.0 : (items.isEmpty ? 0.0 : _shippingFee);

  int get totalItems => _items.fold(0, (sum, item) => sum + item.quantity);

  double get subTotal => _items.fold(0.0, (sum, item) => sum + item.totalActualPrice);
  
  double get totalAmount => (subTotal + shippingFee) - _couponDiscount;

  void addToCart(ProductModel product, String size) {
    final existingIndex = _items.indexWhere(
      (item) => item.product.id == product.id && item.selectedSize == size
    );

    if (existingIndex >= 0) {
      _items[existingIndex].quantity += 1;
    } else {
      _items.add(CartItem(product: product, selectedSize: size));
    }
    _resetCoupon(); // Reset coupon if bag changes
    notifyListeners();
    _saveToPrefs();
  }

  void removeFromCart(String productId, String size) {
    _items.removeWhere((item) => item.product.id == productId && item.selectedSize == size);
    _resetCoupon();
    notifyListeners();
    _saveToPrefs();
  }

  void updateQuantity(String productId, String size, int newQuantity) {
    final index = _items.indexWhere(
      (item) => item.product.id == productId && item.selectedSize == size
    );
    if (index >= 0) {
      if (newQuantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index].quantity = newQuantity;
      }
      _resetCoupon();
      notifyListeners();
      _saveToPrefs();
    }
  }

  bool applyCoupon(String code) {
    final cleanCode = code.toUpperCase().trim();
    if (cleanCode == 'SHIV20') {
      _appliedCoupon = 'SHIV20';
      _couponDiscount = subTotal * 0.20; // 20% off
      notifyListeners();
      return true;
    } else if (cleanCode == 'WELCOME100') {
      _appliedCoupon = 'WELCOME100';
      _couponDiscount = subTotal > 500 ? 100.0 : 0.0; // Flat 100 off on 500+
      if (_couponDiscount > 0) {
        notifyListeners();
        return true;
      }
    }
    return false;
  }

  void removeCoupon() {
    _resetCoupon();
    notifyListeners();
  }

  void _resetCoupon() {
    _appliedCoupon = null;
    _couponDiscount = 0.0;
  }

  void clearCart() {
    _items.clear();
    _resetCoupon();
    notifyListeners();
    _saveToPrefs();
  }

  Future<void> _saveToPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final data = _items.map((item) => {
      'product': item.product.toJson(),
      'selectedSize': item.selectedSize,
      'quantity': item.quantity,
    }).toList();
    await prefs.setString(_storageKey, json.encode(data));
  }

  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final String? data = prefs.getString(_storageKey);
    if (data != null) {
      try {
        final List<dynamic> decoded = json.decode(data);
        _items = decoded.map((item) => CartItem(
          product: ProductModel.fromJson(item['product']),
          selectedSize: item['selectedSize'],
          quantity: item['quantity'],
        )).toList();
        notifyListeners();
      } catch (e) {
        debugPrint('Error loading cart: $e');
      }
    }
  }
}
