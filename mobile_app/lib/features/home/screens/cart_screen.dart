import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/cart_provider.dart';
import '../../../core/widgets/top_toast.dart';
import 'address_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final TextEditingController _couponController = TextEditingController();

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'SHOPPING BAG',
          style: TextStyle(
            color: AppColors.accent, 
            fontWeight: FontWeight.w900,
            fontSize: 16,
            letterSpacing: 1.2,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, color: AppColors.accent),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Consumer<CartProvider>(
        builder: (context, cart, child) {
          if (cart.items.isEmpty) {
            return _buildEmptyCart(context);
          }

          return Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Items List
                    ...cart.items.asMap().entries.map((entry) {
                      final index = entry.key;
                      final item = entry.value;
                      return FadeInUp(
                        delay: Duration(milliseconds: index * 50),
                        child: Column(
                          children: [
                            _buildCartItem(context, cart, item),
                            if (index < cart.items.length - 1)
                              const Divider(height: 32, thickness: 0.5),
                          ],
                        ),
                      );
                    }).toList(),

                    const SizedBox(height: 32),
                    _buildCouponSection(cart),
                    const SizedBox(height: 32),
                    _buildPriceDetails(cart),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
              _buildCheckoutSection(context, cart),
            ],
          );
        },
      ),
    );
  }

  Widget _buildEmptyCart(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_bag_outlined, size: 80, color: Colors.grey[200]),
          const SizedBox(height: 20),
          const Text(
            'Your bag is empty!',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Looks like you haven\'t added anything yet.',
            style: TextStyle(color: Colors.grey[500]),
          ),
          const SizedBox(height: 30),
          SizedBox(
            width: 200,
            height: 50,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accent,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('CONTINUE SHOPPING', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItem(BuildContext context, CartProvider cart, dynamic item) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Image.network(
            item.product.imagePath ?? '',
            width: 90,
            height: 120,
            fit: BoxFit.cover,
            errorBuilder: (c, e, s) => Container(
              width: 90,
              height: 120,
              color: Colors.grey[100],
              child: const Icon(Icons.image_not_supported_outlined, color: Colors.grey),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    item.product.brand ?? 'SHIV',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, size: 20, color: Colors.grey),
                    onPressed: () => cart.removeFromCart(item.product.id, item.selectedSize),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              Text(
                item.product.name,
                style: TextStyle(color: Colors.grey[600], fontSize: 13),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'Size: ${item.selectedSize}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '₹${item.product.price.toInt()}',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17),
                  ),
                  _buildQuantityController(cart, item),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuantityController(CartProvider cart, dynamic item) {
    return Container(
      height: 36,
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.remove_rounded, size: 16),
            onPressed: () => cart.updateQuantity(item.product.id, item.selectedSize, item.quantity - 1),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32),
          ),
          Text(
            '${item.quantity}',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          ),
          IconButton(
            icon: const Icon(Icons.add_rounded, size: 16),
            onPressed: () => cart.updateQuantity(item.product.id, item.selectedSize, item.quantity + 1),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32),
          ),
        ],
      ),
    );
  }

  Widget _buildCouponSection(CartProvider cart) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'COUPONS',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            const Icon(Icons.local_offer_outlined, color: AppColors.primary, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: cart.appliedCoupon != null
                  ? Text(
                      'Coupon Applied: ${cart.appliedCoupon}',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
                    )
                  : const Text(
                      'Apply Coupons',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
            ),
            TextButton(
              onPressed: () => _showCouponModal(cart),
              child: Text(
                cart.appliedCoupon != null ? 'EDIT' : 'APPLY',
                style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _showCouponModal(CartProvider cart) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          top: 24,
          left: 24,
          right: 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Apply Coupon',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _couponController,
              decoration: InputDecoration(
                hintText: 'Enter Coupon Code',
                suffixIcon: TextButton(
                  onPressed: () {
                    final success = cart.applyCoupon(_couponController.text);
                    Navigator.pop(context);
                    if (success) {
                      TopToast.show(context, 'Coupon applied successfully!');
                    } else {
                      TopToast.show(context, 'Invalid coupon code', isError: true);
                    }
                  },
                  child: const Text('APPLY', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
              ),
              textCapitalization: TextCapitalization.characters,
            ),
            const SizedBox(height: 16),
            const Text(
              'Available Coupons:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 8),
            _availableCouponItem('SHIV20', 'Get 20% OFF on all items'),
            _availableCouponItem('WELCOME100', 'Flat ₹100 OFF on orders above ₹500'),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _availableCouponItem(String code, String desc) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(code, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
              Text(desc, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.copy_rounded, size: 18),
            onPressed: () {
              _couponController.text = code;
              TopToast.show(context, 'Code copied');
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPriceDetails(CartProvider cart) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'PRICE DETAILS (${cart.totalItems} Items)',
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1),
        ),
        const SizedBox(height: 16),
        _priceRow('Total MRP', '₹${cart.subTotal.toInt()}'),
        const SizedBox(height: 12),
        _priceRow('Coupon Discount', '-₹${cart.couponDiscount.toInt()}', color: Colors.green),
        const SizedBox(height: 12),
        _priceRow(
          'Shipping Fee', 
          cart.shippingFee == 0 ? 'FREE' : '₹${cart.shippingFee.toInt()}',
          color: cart.shippingFee == 0 ? Colors.green : null,
        ),
        const Divider(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Total Amount',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
            ),
            Text(
              '₹${cart.totalAmount.toInt()}',
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppColors.accent),
            ),
          ],
        ),
      ],
    );
  }

  Widget _priceRow(String label, String value, {Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 14)),
        Text(
          value, 
          style: TextStyle(
            fontWeight: FontWeight.bold, 
            fontSize: 14, 
            color: color ?? AppColors.accent,
          )
        ),
      ],
    );
  }

  Widget _buildCheckoutSection(BuildContext context, CartProvider cart) {
    return Container(
      padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).padding.bottom + 20),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '₹${cart.totalAmount.toInt()}',
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: AppColors.accent),
              ),
              const Text(
                'VIEW DETAILS',
                style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 55,
            child: ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const AddressSelectionScreen()),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text(
                'PLACE ORDER',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, letterSpacing: 1),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
