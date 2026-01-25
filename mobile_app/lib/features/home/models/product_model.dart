class ProductModel {
  final String id;
  final String name;
  final String? description;
  final double price;
  final double? originalPrice;
  final String? imagePath;
  final List<String> images;
  final double? averageRating;
  final int? totalReviews;
  final bool isNew;
  final bool isFeatured;
  final bool isTrending;
  final String? brand;
  final String? tags;
  final double? discountPercentage;
  final String? categoryId;
  final String? categoryName;

  ProductModel({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.originalPrice,
    this.imagePath,
    this.images = const [],
    this.averageRating,
    this.totalReviews,
    this.isNew = false,
    this.isFeatured = false,
    this.isTrending = false,
    this.brand,
    this.tags,
    this.discountPercentage,
    this.categoryId,
    this.categoryName,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    List<String> imageUrls = [];
    if (json['images'] != null) {
      imageUrls = (json['images'] as List)
          .map((img) => img['image_url'] as String)
          .toList();
    }
    
    // If no explicit images list, use the primary image_url if available
    if (imageUrls.isEmpty && json['image_url'] != null) {
      imageUrls.add(json['image_url']);
    }

    return ProductModel(
      id: json['id'],
      name: json['product_name'] ?? 'No Name',
      description: json['description'],
      price: double.tryParse(json['price']?.toString() ?? '0.0') ?? 0.0,
      originalPrice: json['original_price'] != null 
          ? double.tryParse(json['original_price'].toString()) 
          : null,
      imagePath: json['image_url'],
      images: imageUrls,
      averageRating: json['average_rating'] != null
          ? double.tryParse(json['average_rating'].toString())
          : null,
      totalReviews: json['total_reviews'],
      isNew: json['is_new_arrival'] ?? json['is_new'] ?? false,
      isFeatured: json['is_featured'] ?? false,
      isTrending: json['is_trending'] ?? false,
      brand: json['brand'],
      tags: json['tags'],
      discountPercentage: json['discount_percentage'] != null
          ? double.tryParse(json['discount_percentage'].toString())
          : null,
      categoryId: json['category_id'],
      categoryName: json['category']?['category_name'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_name': name,
      'description': description,
      'price': price,
      'original_price': originalPrice,
      'image_url': imagePath,
      'images': images,
      'average_rating': averageRating,
      'total_reviews': totalReviews,
      'is_new_arrival': isNew,
      'is_featured': isFeatured,
      'is_trending': isTrending,
      'brand': brand,
      'tags': tags,
      'discount_percentage': discountPercentage,
      'category_id': categoryId,
    };
  }
}
