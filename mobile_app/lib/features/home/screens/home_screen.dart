import 'package:easy_debounce/easy_debounce.dart';
import 'package:animate_do/animate_do.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/services/product_service.dart';
import '../../../core/services/category_service.dart';
import '../models/category_model.dart';
import '../models/product_model.dart';
import '../widgets/home_app_bar.dart';
import '../widgets/home_drawer.dart';
import '../widgets/home_bottom_nav_bar.dart';
import '../widgets/promo_banner.dart';
import '../widgets/section_header.dart';
import '../widgets/product_card.dart';
import '../widgets/category_chip.dart';
import 'product_listing_screen.dart';
import 'product_details_screen.dart';
import 'categories_screen.dart';
import 'wishlist_screen.dart';
import 'profile_screen.dart';
import '../widgets/view_bag_widget.dart';
import '../widgets/delivery_promise_banner.dart';
import '../../../core/widgets/skeleton.dart';

class HomeScreen extends StatefulWidget {
  final String? userName;
  const HomeScreen({super.key, this.userName});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  int _page = 0;
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  bool _isScrolled = false;

  // Services
  final ProductService _productService = ProductService();
  final CategoryService _categoryService = CategoryService();

  // Data
  List<CategoryModel> _categories = [];
  List<ProductModel> _featuredProducts = [];
  List<ProductModel> _trendingProducts = [];
  List<ProductModel> _newArrivals = [];
  List<ProductModel> _bestSellers = [];
  List<ProductModel> _suggestions = [];

  bool _isLoading = true;
  bool _isSearching = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchData();
    _searchController.addListener(() {
      _onSearchChanged(_searchController.text);
    });
    _scrollController.addListener(() {
      if (_scrollController.offset > 50 && !_isScrolled) {
        setState(() => _isScrolled = true);
      } else if (_scrollController.offset <= 50 && _isScrolled) {
        setState(() => _isScrolled = false);
      }
    });
  }

  Future<void> _onSearchChanged(String query) async {
    if (query.trim().isEmpty) {
      if (_suggestions.isNotEmpty) {
        setState(() {
          _suggestions = [];
          _isSearching = false;
        });
      }
      return;
    }

    EasyDebounce.debounce(
      'search-debounce',
      const Duration(milliseconds: 500),
      () async {
        setState(() => _isSearching = true);
        try {
          final response = await _productService.searchProducts(
            query: query,
            autocomplete: true,
          );
          setState(() {
            _suggestions = response.suggestions;
            _isSearching = false;
          });
        } catch (e) {
          debugPrint('Error fetching suggestions: $e');
          setState(() => _isSearching = false);
        }
      },
    );
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Fetch all data in parallel
      final results = await Future.wait([
        _categoryService.getMainCategories(),
        _productService.getFeaturedProducts(limit: 8),
        _productService.getTrendingProducts(limit: 8),
        _productService.getNewArrivals(limit: 8),
        _productService.getBestSellers(limit: 8),
      ]);

      setState(() {
        _categories = (results[0] as List<CategoryModel>);
        
        // Sort categories to show Men, Women, Kids first
        const priority = {'Men': 1, 'Women': 2, 'Kids': 3};
        _categories.sort((a, b) {
          int pA = priority[a.name] ?? 99;
          int pB = priority[b.name] ?? 99;
          if (pA != pB) return pA.compareTo(pB);
          return a.name.compareTo(b.name);
        });

        _featuredProducts = (results[1] as ProductListResponse).products;
        _trendingProducts = (results[2] as ProductListResponse).products;
        _newArrivals = (results[3] as ProductListResponse).products;
        _bestSellers = (results[4] as ProductListResponse).products;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error fetching data: $e');
      setState(() {
        _errorMessage = 'Failed to load data';
        _isLoading = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load store data: $e'),
            backgroundColor: Colors.redAccent,
            action: SnackBarAction(
              label: 'Retry',
              textColor: Colors.white,
              onPressed: _fetchData,
            ),
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.surface,
      extendBody: true,
      appBar: _buildDynamicAppBar(),
      drawer: HomeDrawer(
        userName: widget.userName,
        currentIndex: _page,
        onPageChange: (index) {
          setState(() => _page = index);
        },
      ),
      bottomNavigationBar: HomeBottomNavBar(
        currentIndex: _page,
        onTap: (index) => setState(() => _page = index),
      ),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: _fetchData,
            color: AppColors.primary,
            child: SafeArea(
              bottom: false,
              child: _buildBody(),
            ),
          ),
          if (_suggestions.isNotEmpty && _page == 0) ...[
            GestureDetector(
              onTap: () => setState(() => _suggestions = []),
              child: Container(color: Colors.black.withOpacity(0.01)),
            ),
            _buildSuggestionsOverlay(),
          ],
          const ViewBagWidget(),
        ],
      ),
    );
  }

  PreferredSizeWidget? _buildDynamicAppBar() {
    switch (_page) {
      case 0:
        return HomeAppBar(isScrolled: _isScrolled);
      case 1:
        return AppBar(
          title: const Text('All Categories', style: TextStyle(color: AppColors.accent, fontWeight: FontWeight.bold, fontSize: 18)),
          backgroundColor: Colors.white,
          elevation: 0,
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.menu_rounded, color: AppColors.accent),
            onPressed: () => _scaffoldKey.currentState?.openDrawer(),
          ),
        );
      case 2:
        return AppBar(
          title: const Text('My Wishlist', style: TextStyle(color: AppColors.accent, fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 1)),
          backgroundColor: Colors.white,
          elevation: 0.5,
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.menu_rounded, color: AppColors.accent),
            onPressed: () => _scaffoldKey.currentState?.openDrawer(),
          ),
        );
      case 3:
        return null; // Profile has its own fancy header
      default:
        return HomeAppBar(isScrolled: _isScrolled);
    }
  }

  Widget _buildBody() {
    switch (_page) {
      case 0:
        return _buildHomeView();
      case 1:
        return FadeIn(child: const CategoriesScreen(isTab: true));
      case 2:
        return FadeIn(child: const WishlistScreen(isTab: true));
      case 3:
        return FadeIn(child: const ProfileScreen());
      default:
        return _buildHomeView();
    }
  }

  Widget _buildHomeView() {
    if (_isLoading) {
      return const HomeScreenSkeleton();
    }

    if (_errorMessage != null && _featuredProducts.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded,
                size: 60, color: Colors.grey),
            const SizedBox(height: 16),
            Text(_errorMessage!, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _fetchData,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      );
    }

    return ListView(
      controller: _scrollController,
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      children: [
        const SizedBox(height: 16),
        _buildWelcomeHeader(),
        const SizedBox(height: 24),
        _buildSearchBar(),
        const SizedBox(height: 24),
        const DeliveryPromiseSlider(),
        const SizedBox(height: 24),
        FadeInDown(child: const PromoBanner()),
        const SizedBox(height: 32),
        
        // Categories Section
        _buildCategoriesSection(),
        const SizedBox(height: 32),
        
        // Featured Products Section
        if (_featuredProducts.isNotEmpty) ...[
          _buildFeaturedSection(),
          const SizedBox(height: 32),
        ],
        
        // Trending Products Section
        if (_trendingProducts.isNotEmpty) ...[
          _buildTrendingSection(),
          const SizedBox(height: 32),
        ],
        
        // New Arrivals Section
        if (_newArrivals.isNotEmpty) ...[
          _buildNewArrivalsSection(),
          const SizedBox(height: 32),
        ],
        
        // Best Sellers Section
        if (_bestSellers.isNotEmpty) ...[
          _buildBestSellersSection(),
          const SizedBox(height: 32),
        ],
        
        const SizedBox(height: 120),
      ],
    );
  }

  Widget _buildWelcomeHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        FadeInLeft(
          child: Row(
            children: [
              Container(
                width: 4,
                height: 16,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'WELCOME, ${widget.userName?.toUpperCase() ?? 'GUEST'}',
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        FadeInLeft(
          delay: const Duration(milliseconds: 100),
          child: RichText(
            text: const TextSpan(
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w900,
                color: AppColors.accent,
                letterSpacing: -1,
                height: 1.1,
              ),
              children: [
                TextSpan(text: 'Explore Your\n'),
                TextSpan(
                  text: 'KalimGo',
                  style: TextStyle(color: AppColors.primary),
                ),
              ],
            ),
          ),
        ),
      
        
      ],
    );
  }

  Widget _buildSearchBar() {
    return FadeInUp(
      delay: const Duration(milliseconds: 200),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: AppColors.accent.withOpacity(0.06),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: TextField(
          controller: _searchController,
          onSubmitted: (value) {
            if (value.trim().isNotEmpty) {
              _navigateToSearch(value);
              setState(() => _suggestions = []);
            }
          },
          style: const TextStyle(fontWeight: FontWeight.w500),
          decoration: InputDecoration(
            hintText: 'Search collections, trends...',
            hintStyle: TextStyle(
              color: AppColors.textSecondary.withOpacity(0.5),
              fontSize: 15,
              fontWeight: FontWeight.w400,
            ),
            prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary, size: 24),
            suffixIcon: _searchController.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.close_rounded, size: 20, color: AppColors.textSecondary),
                    onPressed: () {
                      _searchController.clear();
                      setState(() => _suggestions = []);
                    },
                  )
                : Container(
                    margin: const EdgeInsets.all(8),
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.tune_rounded, color: AppColors.primary, size: 18),
                  ),
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(vertical: 18),
          ),
        ),
      ),
    );
  }

  Widget _buildSuggestionsOverlay() {
    return Positioned(
      top: 155, // Adjusted for HomeAppBar + Welcome Header spacing
      left: 20,
      right: 20,
      child: Material(
        elevation: 8,
        color: Colors.transparent,
        child: FadeIn(
          child: Container(
            constraints: const BoxConstraints(maxHeight: 400),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: ListView.separated(
              shrinkWrap: true,
              padding: EdgeInsets.zero,
              itemCount: _suggestions.length,
              separatorBuilder: (context, index) => Divider(
                height: 1,
                color: Colors.grey[100],
                indent: 16,
                endIndent: 16,
              ),
              itemBuilder: (context, index) {
                final product = _suggestions[index];
                return ListTile(
                  leading: const Icon(Icons.search_rounded,
                      color: Colors.grey, size: 18),
                  title: Text(
                    product.name,
                    style: const TextStyle(fontSize: 14),
                  ),
                  trailing: Text(
                    '₹${product.price.toStringAsFixed(0)}',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                  onTap: () {
                    setState(() => _suggestions = []);
                    _navigateToProductDetails(product);
                  },
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  void _navigateToSearch(String query) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ProductListingScreen(
          title: 'Search: $query',
          searchQuery: query.trim(),
        ),
      ),
    );
  }

  Widget _buildCategoriesSection() {
    return Column(
      children: [
        SectionHeader(
          title: 'Shop By Category',
          onSeeAllTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const CategoriesScreen(),
              ),
            );
          },
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 130,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: _categories.length,
            itemBuilder: (context, index) {
              final category = _categories[index];
              return FadeInRight(
                delay: Duration(milliseconds: index * 50),
                child: CategoryChip(
                  category: category,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ProductListingScreen(
                          title: category.name,
                          categoryId: category.id,
                        ),
                      ),
                    );
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFeaturedSection() {
    return Column(
      children: [
        SectionHeader(
          title: '⭐ Featured Products',
          subtitle: 'Hand-picked just for you',
          onSeeAllTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ProductListingScreen(
                  title: 'Featured Products',
                  isFeatured: true,
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 280,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: _featuredProducts.length,
            itemBuilder: (context, index) {
              return FadeInRight(
                delay: Duration(milliseconds: index * 100),
                child: ProductCard(
                  product: _featuredProducts[index],
                  width: 200,
                  onTap: () => _navigateToProductDetails(_featuredProducts[index]),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildTrendingSection() {
    return Column(
      children: [
        SectionHeader(
          title: '🔥 Trending Now',
          subtitle: 'What everyone is buying',
          onSeeAllTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ProductListingScreen(
                  title: 'Trending Products',
                  isTrending: true,
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 280,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: _trendingProducts.length,
            itemBuilder: (context, index) {
              return FadeInRight(
                delay: Duration(milliseconds: index * 100),
                child: ProductCard(
                  product: _trendingProducts[index],
                  width: 200,
                  showBadge: true,
                  badgeText: 'TRENDING',
                  badgeColor: Colors.orange,
                  onTap: () => _navigateToProductDetails(_trendingProducts[index]),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildNewArrivalsSection() {
    return Column(
      children: [
        SectionHeader(
          title: '✨ New Arrivals',
          subtitle: 'Fresh from the runway',
          onSeeAllTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ProductListingScreen(
                  title: 'New Arrivals',
                  isNewArrival: true,
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.72,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemCount: _newArrivals.length > 4 ? 4 : _newArrivals.length,
          itemBuilder: (context, index) {
            return FadeInUp(
              delay: Duration(milliseconds: index * 100),
              child: ProductCard(
                product: _newArrivals[index],
                showBadge: true,
                badgeText: 'NEW',
                badgeColor: Colors.green,
                onTap: () => _navigateToProductDetails(_newArrivals[index]),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildBestSellersSection() {
    return Column(
      children: [
        SectionHeader(
          title: '🏆 Best Sellers',
          subtitle: 'Top-rated by customers',
          onSeeAllTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ProductListingScreen(
                  title: 'Best Sellers',
                  sortBy: 'average_rating',
                  sortOrder: 'DESC',
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 280,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: _bestSellers.length,
            itemBuilder: (context, index) {
              return FadeInRight(
                delay: Duration(milliseconds: index * 100),
                child: ProductCard(
                  product: _bestSellers[index],
                  width: 200,
                  showRating: true,
                  onTap: () => _navigateToProductDetails(_bestSellers[index]),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  void _navigateToProductDetails(ProductModel product) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ProductDetailsScreen(product: product),
      ),
    );
  }
}
