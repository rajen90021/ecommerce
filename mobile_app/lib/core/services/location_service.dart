import 'package:geolocator/geolocator.dart';
import 'package:flutter/material.dart';

class LocationService {
  static Future<bool> hasPermission() async {
    LocationPermission permission = await Geolocator.checkPermission();
    return permission == LocationPermission.always || permission == LocationPermission.whileInUse;
  }

  static Future<void> forceRequestPermission(BuildContext context) async {
    bool serviceEnabled;
    LocationPermission permission;

    // Check if services are enabled
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (context.mounted) {
        await _showPermissionDialog(
          context, 
          "Location Services Disabled", 
          "Please enable location services to continue using the app.",
          () => Geolocator.openLocationSettings(),
        );
      }
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.deniedForever) {
      if (context.mounted) {
        await _showPermissionDialog(
          context, 
          "Permission Required", 
          "You have permanently denied location permissions. Please enable them in settings to place orders.",
          () => Geolocator.openAppSettings(),
        );
      }
    }
  }

  static Future<void> _showPermissionDialog(
    BuildContext context, 
    String title, 
    String body, 
    VoidCallback onOpenSettings
  ) async {
    return showDialog(
      context: context,
      barrierDismissible: false, // Force them to interact
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        content: Text(body),
        actions: [
          TextButton(
            onPressed: () {
              onOpenSettings();
              Navigator.pop(context);
            },
            child: const Text("OPEN SETTINGS", style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
