import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../features/home/models/address_model.dart';

class AddressProvider extends ChangeNotifier {
  List<AddressModel> _addresses = [];
  final String _storageKey = 'user_addresses';
  AddressModel? _selectedAddress;

  AddressProvider() {
    _loadFromPrefs();
  }

  List<AddressModel> get addresses => _addresses;
  AddressModel? get selectedAddress => _selectedAddress;

  void selectAddress(AddressModel address) {
    _selectedAddress = address;
    notifyListeners();
  }

  Future<void> addAddress(AddressModel address) async {
    // If it's the first address, make it default
    bool makeDefault = _addresses.isEmpty || address.isDefault;
    
    final newAddress = AddressModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: address.name,
      mobile: address.mobile,
      flatHouse: address.flatHouse,
      areaLocality: address.areaLocality,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: makeDefault,
    );

    if (makeDefault) {
      // Unset other defaults
      _addresses = _addresses.map((a) => AddressModel(
        id: a.id, name: a.name, mobile: a.mobile, flatHouse: a.flatHouse,
        areaLocality: a.areaLocality, city: a.city, state: a.state,
        pincode: a.pincode, isDefault: false,
      )).toList();
      _selectedAddress = newAddress;
    }

    _addresses.add(newAddress);
    notifyListeners();
    await _saveToPrefs();
  }

  Future<void> removeAddress(String id) async {
    _addresses.removeWhere((a) => a.id == id);
    if (_selectedAddress?.id == id) {
      _selectedAddress = _addresses.isNotEmpty ? _addresses.first : null;
    }
    notifyListeners();
    await _saveToPrefs();
  }

  Future<void> _saveToPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final data = _addresses.map((a) => a.toJson()).toList();
    await prefs.setString(_storageKey, json.encode(data));
  }

  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final String? data = prefs.getString(_storageKey);
    if (data != null) {
      final List<dynamic> decoded = json.decode(data);
      _addresses = decoded.map((a) => AddressModel.fromJson(a)).toList();
      
      // Default selection to the default address or the first one
      _selectedAddress = _addresses.firstWhere(
        (a) => a.isDefault, 
        orElse: () => _addresses.first,
      );
      
      notifyListeners();
    }
  }
}
