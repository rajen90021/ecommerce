import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/constants/assets.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/cart_provider.dart';
import '../screens/cart_screen.dart';

class HomeAppBar extends StatelessWidget implements PreferredSizeWidget {
  final bool isScrolled;
  const HomeAppBar({super.key, required this.isScrolled});

  @override
  Widget build(BuildContext context) {
    return PreferredSize(
      preferredSize: const Size.fromHeight(kToolbarHeight + 10),
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
          child: AppBar(
            backgroundColor: Colors.white.withOpacity(0.85),
            elevation: isScrolled ? 0.5 : 0,
            centerTitle: true,
            leading: FadeInLeft(
              duration: const Duration(milliseconds: 500),
              child: IconButton(
                onPressed: () => Scaffold.of(context).openDrawer(),
                icon: const Icon(Icons.menu_rounded, color: AppColors.accent, size: 28),
              ),
            ),
            title: FadeInDown(
              duration: const Duration(milliseconds: 600),
              child: Hero(
                tag: 'app_logo',
                child: Image.asset(
                  AppAssets.logo, 
                  height: 38, 
                  errorBuilder: (c, e, s) => const Text(
                    "SHIV",
                    style: TextStyle(
                      color: AppColors.accent,
                      fontWeight: FontWeight.w900,
                      fontSize: 18,
                      letterSpacing: 2,
                    ),
                  ),
                ),
              ),
            ),
            actions: [
              FadeInRight(
                duration: const Duration(milliseconds: 500),
                delay: const Duration(milliseconds: 100),
                child: IconButton(
                  onPressed: () {},
                  icon: const Icon(Icons.notifications_none_rounded, color: AppColors.accent, size: 28),
                ),
              ),
              Consumer<CartProvider>(
                builder: (context, cart, child) => FadeInRight(
                  duration: const Duration(milliseconds: 500),
                  delay: const Duration(milliseconds: 200),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      IconButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const CartScreen(),
                              fullscreenDialog: true,
                            ),
                          );
                        },
                        icon: const Icon(Icons.shopping_bag_outlined, color: AppColors.accent, size: 28),
                      ),
                      if (cart.totalItems > 0)
                        Positioned(
                          right: 8,
                          top: 10,
                          child: BounceInDown(
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                              ),
                              constraints: const BoxConstraints(
                                minWidth: 18,
                                minHeight: 18,
                              ),
                              child: Text(
                                "${cart.totalItems}",
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight + 10);
}
