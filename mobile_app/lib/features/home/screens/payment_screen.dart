import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/cart_provider.dart';
import '../../../core/providers/address_provider.dart';
import 'order_success_screen.dart';

class PaymentSelectionScreen extends StatefulWidget {
  const PaymentSelectionScreen({super.key});

  @override
  State<PaymentSelectionScreen> createState() => _PaymentSelectionScreenState();
}

class _PaymentSelectionScreenState extends State<PaymentSelectionScreen> {
  String _selectedMethod = 'COD'; // Default to COD

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'PAYMENT',
          style: TextStyle(
            color: AppColors.accent, 
            fontWeight: FontWeight.w900,
            fontSize: 14,
            letterSpacing: 1,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: Consumer<CartProvider>(
        builder: (context, cart, child) {
          return Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(24),
                  children: [
                    _buildPaymentOption('COD', 'Cash on Delivery (Cash/UPI)', Icons.money_rounded),
                    _buildPaymentOption('CARD', 'Credit / Debit Card', Icons.credit_card_rounded, enabled: false),
                    _buildPaymentOption('UPI', 'Google Pay / PhonePe', Icons.account_balance_wallet_outlined, enabled: false),
                    
                    const SizedBox(height: 40),
                    const Text(
                      'PRICE DETAILS',
                      style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1),
                    ),
                    const SizedBox(height: 16),
                    _priceRow('Total MRP', '₹${cart.subTotal.toInt()}'),
                    if (cart.couponDiscount > 0)
                      _priceRow('Coupon Discount', '-₹${cart.couponDiscount.toInt()}', color: Colors.green),
                    _priceRow('Shipping Fee', cart.shippingFee == 0 ? 'FREE' : '₹${cart.shippingFee.toInt()}'),
                    const Divider(height: 32),
                    _priceRow('Total Amount', '₹${cart.totalAmount.toInt()}', isBold: true),
                  ],
                ),
              ),
              _buildBottomButton(context, cart),
            ],
          );
        },
      ),
    );
  }

  Widget _buildPaymentOption(String id, String label, IconData icon, {bool enabled = true}) {
    bool isSelected = _selectedMethod == id;
    return GestureDetector(
      onTap: enabled ? () => setState(() => _selectedMethod = id) : null,
      child: Opacity(
        opacity: enabled ? 1.0 : 0.5,
        child: Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(15),
            border: Border.all(
              color: isSelected ? AppColors.primary : Colors.grey[200]!,
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              Icon(
                isSelected ? Icons.check_circle_rounded : Icons.radio_button_off_rounded,
                color: isSelected ? AppColors.primary : Colors.grey,
              ),
              const SizedBox(width: 16),
              Icon(icon, color: AppColors.accent, size: 24),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    if (!enabled)
                      const Text('Coming Soon', style: TextStyle(color: Colors.orange, fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _priceRow(String label, String value, {Color? color, bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: isBold ? AppColors.accent : Colors.grey[600], fontSize: 14, fontWeight: isBold ? FontWeight.w900 : FontWeight.normal)),
          Text(value, style: TextStyle(fontWeight: FontWeight.w900, fontSize: isBold ? 18 : 14, color: color ?? AppColors.accent)),
        ],
      ),
    );
  }

  Widget _buildBottomButton(BuildContext context, CartProvider cart) {
    return Container(
      padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).padding.bottom + 20),
      color: Colors.white,
      child: SizedBox(
        width: double.infinity,
        height: 55,
        child: ElevatedButton(
          onPressed: () {
            // Place Order Logic
            final address = Provider.of<AddressProvider>(context, listen: false).selectedAddress;
            if (address != null) {
              // Mark order as placed locally for now
              cart.clearCart();
              Navigator.pushAndRemoveUntil(
                context, 
                MaterialPageRoute(builder: (_) => const OrderSuccessScreen()),
                (route) => route.isFirst,
              );
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: const Text('PAY & PLACE ORDER', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
        ),
      ),
    );
  }
}
