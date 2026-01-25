import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/address_provider.dart';
import '../models/address_model.dart';
import 'payment_screen.dart';
import 'location_picker_screen.dart';

class AddressSelectionScreen extends StatelessWidget {
  const AddressSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'SELECT ADDRESS',
          style: TextStyle(
            color: AppColors.accent, 
            fontWeight: FontWeight.w900,
            fontSize: 14,
            letterSpacing: 1,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.accent, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Consumer<AddressProvider>(
        builder: (context, addressProvider, child) {
          return Column(
            children: [
              Expanded(
                child: addressProvider.addresses.isEmpty
                    ? _buildEmptyState(context)
                    : ListView.builder(
                        padding: const EdgeInsets.all(20),
                        itemCount: addressProvider.addresses.length,
                        itemBuilder: (context, index) {
                          final address = addressProvider.addresses[index];
                          final isSelected = addressProvider.selectedAddress?.id == address.id;
                          return FadeInUp(
                            delay: Duration(milliseconds: index * 50),
                            child: _buildAddressCard(context, addressProvider, address, isSelected),
                          );
                        },
                      ),
              ),
              _buildBottomButton(context, addressProvider),
            ],
          );
        },
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.location_on_outlined, size: 80, color: Colors.grey[200]),
          const SizedBox(height: 20),
          const Text(
            'No address saved yet',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 30),
          _addAddressButton(context),
        ],
      ),
    );
  }

  Widget _addAddressButton(BuildContext context) {
    return TextButton.icon(
      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MapLocationPicker())),
      icon: const Icon(Icons.add_location_alt_rounded, color: AppColors.primary),
      label: const Text(
        'USE GOOGLE MAPS TO ADD',
        style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
      ),
      style: TextButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 15),
        side: const BorderSide(color: AppColors.primary, width: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      ),
    );
  }

  Widget _buildAddressCard(BuildContext context, AddressProvider provider, AddressModel address, bool isSelected) {
    return GestureDetector(
      onTap: () => provider.selectAddress(address),
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
          boxShadow: isSelected ? [
            BoxShadow(color: AppColors.primary.withOpacity(0.1), blurRadius: 10)
          ] : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  isSelected ? Icons.check_circle_rounded : Icons.radio_button_off_rounded,
                  color: isSelected ? AppColors.primary : Colors.grey,
                  size: 20,
                ),
                const SizedBox(width: 12),
                Text(
                  address.name,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.only(left: 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(address.fullAddress, style: TextStyle(color: Colors.grey[600], fontSize: 13, height: 1.4)),
                  const SizedBox(height: 8),
                  Text('Mobile: ${address.mobile}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ),
            ),
            if (isSelected) ...[
              const SizedBox(height: 16),
              const Divider(),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => provider.removeAddress(address.id!), 
                  child: const Text('REMOVE', style: TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold))
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildBottomButton(BuildContext context, AddressProvider provider) {
    return Container(
      padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).padding.bottom + 20),
      color: Colors.white,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (provider.addresses.isNotEmpty) ...[
            _addAddressButton(context),
            const SizedBox(height: 16),
          ],
          SizedBox(
            width: double.infinity,
            height: 55,
            child: ElevatedButton(
              onPressed: provider.selectedAddress == null ? null : () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const PaymentSelectionScreen()));
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                elevation: 0,
              ),
              child: const Text('DELIVER TO THIS ADDRESS', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
            ),
          ),
        ],
      ),
    );
  }
}
