import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/assets.dart';
import '../../../core/theme/app_colors.dart';
import '../../auth/screens/phone_auth_screen.dart';

class HomeDrawer extends StatelessWidget {
  final String? userName;
  final Function(int)? onPageChange;
  final int? currentIndex;
  const HomeDrawer({super.key, this.userName, this.onPageChange, this.currentIndex});

  Future<void> _signOut(BuildContext context) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
      await FirebaseAuth.instance.signOut();
      
      if (context.mounted) {
        Navigator.pushAndRemoveUntil(
          context, 
          MaterialPageRoute(builder: (_) => const LoginScreen()),
          (route) => false,
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error signing out: $e")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topRight: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
      ),
      child: Column(
        children: [
          _buildHeader(context),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),
                  _buildSectionLabel('SHOP'),
                  _drawerItem(Icons.home_filled, "Search & Shop", _onItemTap(0), currentIndex == 0),
                  _drawerItem(Icons.category_rounded, "Categories", _onItemTap(1), currentIndex == 1),
                  _drawerItem(Icons.local_offer_rounded, "Top Offers", null, false),
                  
                  const SizedBox(height: 24),
                  _buildSectionLabel('MY ACCOUNT'),
                  _drawerItem(Icons.person_rounded, "My Profile", _onItemTap(3), currentIndex == 3),
                  _drawerItem(Icons.shopping_bag_rounded, "My Orders", null, false),
                  _drawerItem(Icons.favorite_rounded, "Wishlist", _onItemTap(2), currentIndex == 2),
                  _drawerItem(Icons.location_on_rounded, "Addresses", null, false),
                  
                  const SizedBox(height: 24),
                  _buildSectionLabel('SUPPORT & SETTINGS'),
                  _drawerItem(Icons.help_center_rounded, "Help Center", null, false),
                  _drawerItem(Icons.notifications_active_rounded, "Notification Settings", null, false),
                  _drawerItem(Icons.security_rounded, "Privacy Policy", null, false),
                ],
              ),
            ),
          ),
          
          const Divider(height: 1, indent: 24, endIndent: 24),
          _buildFooter(context),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 60, 24, 24),
      decoration: const BoxDecoration(
        color: AppColors.accent,
        borderRadius: BorderRadius.only(bottomRight: Radius.circular(30)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(3),
            decoration: const BoxDecoration(
              color: Colors.white24,
              shape: BoxShape.circle,
            ),
            child: CircleAvatar(
              radius: 28,
              backgroundColor: Colors.white,
              child: Image.asset(
                AppAssets.logo, 
                height: 30, 
                errorBuilder: (c, e, s) => const Icon(Icons.person, color: AppColors.accent, size: 30)
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Hello,",
                  style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 14),
                ),
                Text(
                  userName ?? "Guest User",
                  style: const TextStyle(
                    color: Colors.white, 
                    fontSize: 18, 
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.close_rounded, color: Colors.white60),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(left: 12, bottom: 8),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w900,
          color: Colors.grey[400],
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: GestureDetector(
        onTap: () => _signOut(context),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: Colors.red[50],
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Icon(Icons.logout_rounded, color: Colors.redAccent, size: 20),
              SizedBox(width: 12),
              Text(
                "Sign Out",
                style: TextStyle(
                  color: Colors.redAccent,
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  VoidCallback? _onItemTap(int index) {
    return () {
      if (onPageChange != null) {
        onPageChange!(index);
      }
    };
  }

  Widget _drawerItem(IconData icon, String title, VoidCallback? onTap, bool isSelected) {
    return FadeInLeft(
      duration: const Duration(milliseconds: 400),
      child: Container(
        margin: const EdgeInsets.only(bottom: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.08) : Colors.transparent,
          borderRadius: BorderRadius.circular(15),
        ),
        child: ListTile(
          dense: true,
          visualDensity: VisualDensity.compact,
          leading: Icon(
            icon, 
            color: isSelected ? AppColors.primary : AppColors.accent.withOpacity(0.7),
            size: 22,
          ),
          title: Text(
            title, 
            style: TextStyle(
              color: isSelected ? AppColors.primary : AppColors.textPrimary, 
              fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
              fontSize: 14,
            )
          ),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
          onTap: () {
            if (onTap != null) {
              onTap();
            }
          },
        ),
      ),
    );
  }
}
