import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:provider/provider.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/top_toast.dart';
import '../../../core/providers/address_provider.dart';
import '../models/address_model.dart';

class MapLocationPicker extends StatefulWidget {
  const MapLocationPicker({super.key});

  @override
  State<MapLocationPicker> createState() => _MapLocationPickerState();
}

class _MapLocationPickerState extends State<MapLocationPicker> {
  static const LatLng _kalimpongCenter = LatLng(27.0594, 88.4731);
  LatLng _lastSelectedPos = _kalimpongCenter;
  String _addressLine = "Locating your address...";
  bool _isLoading = false;
  GoogleMapController? _mapController;
  
  final _searchController = TextEditingController();
  final _nameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _houseController = TextEditingController();
  final _areaController = TextEditingController();
  
  String? _primaryPhone;

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _getCurrentLocation();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final userDataStr = prefs.getString('user_data');
    if (userDataStr != null) {
      final userData = jsonDecode(userDataStr);
      setState(() {
        _nameController.text = userData['name'] ?? '';
        _primaryPhone = userData['phone'];
        _mobileController.text = _primaryPhone ?? '';
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _nameController.dispose();
    _mobileController.dispose();
    _houseController.dispose();
    _areaController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      TopToast.show(context, "Location services are disabled", isError: true);
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    try {
      Position position = await Geolocator.getCurrentPosition();
      LatLng currentPos = LatLng(position.latitude, position.longitude);
      _mapController?.animateCamera(CameraUpdate.newLatLngZoom(currentPos, 16));
      _onCameraIdle(currentPos);
    } catch (e) {
      debugPrint("Error getting location: $e");
    }
  }

  Future<void> _searchAddress(String query) async {
    if (query.isEmpty) return;
    
    setState(() => _isLoading = true);
    try {
      List<Location> locations = await locationFromAddress(query);
      if (locations.isNotEmpty) {
        final loc = locations.first;
        final target = LatLng(loc.latitude, loc.longitude);
        _mapController?.animateCamera(CameraUpdate.newLatLngZoom(target, 16));
        _onCameraIdle(target);
      }
    } catch (e) {
      TopToast.show(context, "Place not found", isError: true);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _onCameraIdle(LatLng position) async {
    setState(() {
      _isLoading = true;
      _lastSelectedPos = position;
    });

    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(position.latitude, position.longitude);
      if (placemarks.isNotEmpty) {
        final p = placemarks.first;
        setState(() {
          _addressLine = "${p.name ?? ''}, ${p.subLocality ?? ''}, ${p.locality ?? ''}, ${p.postalCode ?? ''}";
          _houseController.text = p.name ?? '';
          _areaController.text = "${p.subLocality ?? ''}, ${p.thoroughfare ?? ''}".trim();
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _addressLine = "Address not found";
        _isLoading = false;
      });
    }
  }

  void _showOutOfServiceModal() {
    showDialog(
      context: context,
      builder: (context) => FadeInUp(
        duration: const Duration(milliseconds: 300),
        child: AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 10),
              Icon(Icons.sentiment_dissatisfied_rounded, size: 80, color: Colors.grey[400]),
              const SizedBox(height: 20),
              const Text(
                'Out of Service Area',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.accent),
              ),
              const SizedBox(height: 12),
              Text(
                'Currently, we are delivering only in Kalimpong & Siliguri. Hang tight, we will be in your place soon!',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600], fontSize: 13, height: 1.5),
              ),
              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('GOT IT', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showDetailsSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom + 30,
          top: 30,
          left: 24,
          right: 24,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Exact Address Details',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.accent),
              ),
              const SizedBox(height: 8),
              Text(
                "Refine your location to help our delivery partner find you easily.",
                style: TextStyle(fontSize: 12, color: Colors.grey[500]),
              ),
              const SizedBox(height: 24),
              _buildRefineField(_houseController, 'House No. / Building / Floor', Icons.business_outlined),
              const SizedBox(height: 16),
              _buildRefineField(_areaController, 'Area / Locality / Landmark', Icons.location_on_outlined),
              const SizedBox(height: 16),
              _buildRefineField(_nameController, 'Receiver Name', Icons.person_outline),
              const SizedBox(height: 16),
              _buildRefineField(_mobileController, 'Contact Number', Icons.phone_android_outlined, keyboardType: TextInputType.phone),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  onPressed: _saveAndExit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  ),
                  child: const Text('SAVE ADDRESS', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRefineField(TextEditingController controller, String label, IconData icon, {TextInputType? keyboardType}) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: Colors.grey[500], fontSize: 13, fontWeight: FontWeight.normal),
        prefixIcon: Icon(icon, size: 20, color: Colors.black),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide(color: Colors.grey[200]!)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide(color: Colors.grey[200]!)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: const BorderSide(color: Colors.black, width: 2)),
      ),
    );
  }

  Future<void> _saveAndExit() async {
    if (_nameController.text.isEmpty || _houseController.text.isEmpty) {
      TopToast.show(context, "Please fill all required details", isError: true);
      return;
    }

    String finalPhone = _mobileController.text.isEmpty ? (_primaryPhone ?? '') : _mobileController.text;
    if (finalPhone.isEmpty) {
      TopToast.show(context, "Please provide a contact number", isError: true);
      return;
    }

    try {
      List<Placemark> p = await placemarkFromCoordinates(_lastSelectedPos.latitude, _lastSelectedPos.longitude);
      final placemark = p.first;
      
      final String city = (placemark.locality ?? '').toLowerCase();
      final String district = (placemark.subAdministrativeArea ?? '').toLowerCase();
      
      bool isServiceable = city.contains('kalimpong') || 
                          city.contains('siliguri') || 
                          district.contains('kalimpong') || 
                          district.contains('darjeeling');

      if (!isServiceable) {
        Navigator.pop(context); // Close sheet
        _showOutOfServiceModal();
        return;
      }
      
      final address = AddressModel(
        name: _nameController.text,
        mobile: finalPhone,
        flatHouse: _houseController.text,
        areaLocality: _areaController.text,
        city: placemark.locality ?? '',
        state: placemark.administrativeArea ?? '',
        pincode: placemark.postalCode ?? '',
        isDefault: true,
      );

      if (!mounted) return;
      Provider.of<AddressProvider>(context, listen: false).addAddress(address);
      Navigator.pop(context); // Close sheet
      Navigator.pop(context); // Exit map
      TopToast.show(context, "Address saved successfully!");
    } catch (e) {
      TopToast.show(context, "Error saving location", isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: const CameraPosition(target: _kalimpongCenter, zoom: 15),
            onMapCreated: (controller) => _mapController = controller,
            onCameraMove: (position) => _lastSelectedPos = position.target,
            onCameraIdle: () => _onCameraIdle(_lastSelectedPos),
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            mapToolbarEnabled: false,
          ),
          
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            left: 15,
            right: 15,
            child: Container(
              height: 55,
              padding: const EdgeInsets.symmetric(horizontal: 5),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.black),
                    onPressed: () => Navigator.pop(context),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      decoration: const InputDecoration(
                        hintText: 'Search for a new area, locality...',
                        hintStyle: TextStyle(color: Colors.grey, fontSize: 13),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 10),
                      ),
                      style: const TextStyle(fontSize: 14),
                      onSubmitted: (val) => _searchAddress(val),
                      onChanged: (val) {
                        EasyDebounce.debounce(
                          'map-search', 
                          const Duration(milliseconds: 1000), 
                          () => _searchAddress(val)
                        );
                      },
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.only(right: 10),
                    child: Icon(Icons.search, color: Colors.grey),
                  ),
                ],
              ),
            ),
          ),

          Center(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 40),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: Colors.black, shape: BoxShape.circle),
                    child: const Icon(Icons.location_on, color: Colors.white, size: 30),
                  ),
                  Container(height: 20, width: 2, color: Colors.black),
                ],
              ),
            ),
          ),

          Positioned(
            bottom: 20,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 20)],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Delivering your order to',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      TextButton(
                        onPressed: _getCurrentLocation,
                        style: TextButton.styleFrom(backgroundColor: Colors.black, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4)),
                        child: const Text('Allow Location', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(12)),
                    child: Row(
                      children: [
                        const Icon(Icons.location_on, color: Colors.black, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _addressLine,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, height: 1.2),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            _searchController.clear();
                            FocusScope.of(context).unfocus();
                          },
                          child: const Text('Change', style: TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 55,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _showDetailsSheet,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Text('Add Exact Address Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, letterSpacing: 0.5)),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_forward_ios, size: 14),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          Positioned(
            right: 20,
            bottom: 230,
            child: FloatingActionButton(
              onPressed: _getCurrentLocation,
              backgroundColor: Colors.white,
              mini: true,
              child: const Icon(Icons.my_location, color: Colors.black),
            ),
          ),
        ],
      ),
    );
  }
}
