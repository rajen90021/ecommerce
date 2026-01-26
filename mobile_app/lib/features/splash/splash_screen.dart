import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../features/home/screens/home_screen.dart';
import '../../core/constants/assets.dart';
import '../../core/theme/app_colors.dart';
import '../../core/services/location_service.dart';
import '../../onboarding_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _navigateToNext();
    });
  }

  _navigateToNext() async {
    try {
      await Future.delayed(const Duration(seconds: 3));
      if (!mounted) return;

      // Safe location check
      try {
        bool hasLoc = await LocationService.hasPermission();
        if (!hasLoc) {
          await LocationService.forceRequestPermission(context).timeout(const Duration(seconds: 5));
        }
      } catch (e) {
        debugPrint("Location service timeout or error: $e");
      }

      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      final userDataStr = prefs.getString('user_data');

      Widget nextScreen;
      if (token != null && token.isNotEmpty) {
        String? name;
        if (userDataStr != null) {
          try {
            final userData = jsonDecode(userDataStr);
            name = userData['name'];
          } catch (e) {
            debugPrint("Error decoding user data: $e");
          }
        }
        nextScreen = HomeScreen(userName: name);
      } else {
        nextScreen = const OnboardingScreen();
      }

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => nextScreen),
        );
      }
    } catch (e) {
      debugPrint("Fatal error in SplashScreen: $e");
      // Fallback to onboarding if anything goes wrong
      if (mounted) {
        Navigator.pushReplacement(
          context, 
          MaterialPageRoute(builder: (context) => const OnboardingScreen())
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      ),
    );
  }
}
