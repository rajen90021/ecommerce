import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/assets.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/cart_provider.dart';
import '../screens/cart_screen.dart';

class HomeAppBar extends StatelessWidget implements PreferredSizeWidget {
  final bool isScrolled;
  const HomeAppBar({super.key, required this.isScrolled});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: isScrolled ? 0.5 : 0,
      centerTitle: true,
      leading: IconButton(
        onPressed: () => Scaffold.of(context).openDrawer(),
        icon: const Icon(Icons.menu_rounded, color: AppColors.accent),
      ),
      title: Hero(
        tag: 'app_logo',
        child: Image.asset(
          AppAssets.logo, 
          height: 32, 
          errorBuilder: (c, e, s) => const Text(
            "SHIV ENTERPRISE",
            style: TextStyle(
              color: AppColors.accent,
              fontWeight: FontWeight.w900,
              fontSize: 16,
              letterSpacing: 1,
            ),
          ),
        ),
      ),
      actions: [
        IconButton(
          onPressed: () {},
          icon: const Icon(Icons.notifications_none_rounded, color: AppColors.accent, size: 26),
        ),
        Consumer<CartProvider>(
          builder: (context, cart, child) => Stack(
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
                icon: const Icon(Icons.shopping_bag_outlined, color: AppColors.accent, size: 26),
              ),
              if (cart.totalItems > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 16,
                      minHeight: 16,
                    ),
                    child: Text(
                      "${cart.totalItems}",
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
