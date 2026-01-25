import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/providers/cart_provider.dart';
import '../../../core/providers/wishlist_provider.dart';
import '../../../core/widgets/top_toast.dart';
import '../models/product_model.dart';

class ProductDetailsScreen extends StatefulWidget {
  final ProductModel product;
  const ProductDetailsScreen({super.key, required this.product});

  @override
  State<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  final PageController _imageController = PageController();
  int _selectedSize = 1; // Default M
  final List<String> _sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  @override
  Widget build(BuildContext context) {
    final wishlist = Provider.of<WishlistProvider>(context);
    final isFavorite = wishlist.isFavorite(widget.product.id);

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Content
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image Gallery
                _buildImageGallery(),
                
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header: Name & Price
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: FadeInLeft(
                              child: Text(
                                widget.product.name,
                                style: const TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.accent,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ),
                          ),
                          FadeInRight(
                            child: Text(
                              "₹${widget.product.price.toStringAsFixed(0)}",
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.w900,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 12),
                      
                      // Rating
                      FadeInLeft(
                        delay: const Duration(milliseconds: 100),
                        child: Row(
                          children: [
                            const Icon(Icons.star_rounded, color: Colors.amber, size: 20),
                            const SizedBox(width: 4),
                            Text(
                              "${widget.product.averageRating ?? 4.5}",
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              "(${widget.product.totalReviews ?? 0} Reviews)",
                              style: TextStyle(color: Colors.grey[500], fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Description
                      FadeInUp(
                        delay: const Duration(milliseconds: 200),
                        child: const Text(
                          "Description",
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(height: 8),
                      FadeInUp(
                        delay: const Duration(milliseconds: 300),
                        child: Text(
                          widget.product.description ?? "No description available.",
                          style: TextStyle(
                            color: Colors.grey[600],
                            height: 1.6,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 32),
                      
                      // Size Selection
                      FadeInUp(
                        delay: const Duration(milliseconds: 400),
                        child: const Text(
                          "Select Size",
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(height: 16),
                      FadeInUp(
                        delay: const Duration(milliseconds: 500),
                        child: SizedBox(
                          height: 50,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: _sizes.length,
                            itemBuilder: (context, index) {
                              bool isSelected = _selectedSize == index;
                              return GestureDetector(
                                onTap: () => setState(() => _selectedSize = index),
                                child: Container(
                                  width: 50,
                                  margin: const EdgeInsets.only(right: 12),
                                  decoration: BoxDecoration(
                                    color: isSelected ? Colors.black : Colors.grey[100],
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: isSelected ? Colors.black : Colors.transparent,
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      _sizes[index],
                                      style: TextStyle(
                                        color: isSelected ? Colors.white : Colors.black,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 120), // Spacer for bottom navigation
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Custom App Bar
          Positioned(
            top: 50,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _circularButton(
                  icon: Icons.arrow_back_ios_new_rounded,
                  onTap: () => Navigator.pop(context),
                ),
                _circularButton(
                  icon: isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                  color: isFavorite ? Colors.red : Colors.black,
                  onTap: () {
                    wishlist.toggleWishlist(widget.product);
                    TopToast.show(
                      context, 
                      isFavorite ? "Removed from wishlist" : "Added to wishlist"
                    );
                  },
                ),
              ],
            ),
          ),
          
          // Bottom Cart Button
          Positioned(
            bottom: 30,
            left: 24,
            right: 24,
            child: FadeInUp(
              duration: const Duration(milliseconds: 800),
              child: Consumer<CartProvider>(
                builder: (context, cart, child) => GestureDetector(
                  onTap: () {
                    cart.addToCart(widget.product, _sizes[_selectedSize]);
                    TopToast.show(context, "${widget.product.name} added to bag!");
                  },
                  child: Container(
                    height: 65,
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.3),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.shopping_bag_outlined, color: Colors.white, size: 22),
                        SizedBox(width: 12),
                        Text(
                          "Add to Bag",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageGallery() {
    final images = widget.product.images.isNotEmpty 
        ? widget.product.images 
        : [widget.product.imagePath ?? ''];

    return Stack(
      children: [
        SizedBox(
          height: 450,
          child: PageView.builder(
            controller: _imageController,
            itemCount: images.length,
            itemBuilder: (context, index) {
              return Hero(
                tag: widget.product.id,
                child: Image.network(
                  images[index],
                  fit: BoxFit.cover,
                  width: double.infinity,
                  errorBuilder: (c, e, s) => Container(
                    color: Colors.grey[200],
                    child: const Icon(Icons.image, size: 100, color: Colors.grey),
                  ),
                ),
              );
            },
          ),
        ),
        
        // Indicator
        if (images.length > 1)
          Positioned(
            bottom: 30,
            left: 0,
            right: 0,
            child: Center(
              child: SmoothPageIndicator(
                controller: _imageController,
                count: images.length,
                effect: const ExpandingDotsEffect(
                  activeDotColor: Colors.black,
                  dotColor: Colors.white70,
                  dotHeight: 8,
                  dotWidth: 8,
                  expansionFactor: 3,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _circularButton({required IconData icon, required VoidCallback onTap, Color color = Colors.black}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 45,
        width: 45,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Icon(icon, size: 20, color: color),
      ),
    );
  }
}
