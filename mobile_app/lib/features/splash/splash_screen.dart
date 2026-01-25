import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../features/home/screens/home_screen.dart';
import '../../core/constants/assets.dart';
import '../../core/theme/app_colors.dart';
import '../../core/services/location_service.dart';
import '../../core/widgets/app_loading.dart';
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
    _navigateToNext();
  }

  _navigateToNext() async {
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;

    // Force Location Permission before proceeding
    bool hasLoc = await LocationService.hasPermission();
    while (!hasLoc) {
      if (!mounted) return;
      await LocationService.forceRequestPermission(context);
      await Future.delayed(const Duration(seconds: 2)); // Wait for user to return from settings
      hasLoc = await LocationService.hasPermission();
    }

    if (!mounted) return;
    
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
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => nextScreen,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 1000),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            FadeInDown(
              duration: const Duration(seconds: 1),
              child: Image.asset(
                AppAssets.logo,
                width: 220,
                errorBuilder: (context, error, stackTrace) => const Icon(Icons.shopping_bag_rounded, size: 100, color: AppColors.primary),
              ),
            ),
            const SizedBox(height: 50),
            FadeInUp(
              delay: const Duration(milliseconds: 500),
              child: const AppLoading(size: 40),
            ),
          ],
        ),
      ),
    );
  }
}
