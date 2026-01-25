class CategoryModel {
  final String id;
  final String name;
  final String? imageUrl;
  final String? parentCatId;
  final String? urlSlug;

  CategoryModel({
    required this.id,
    required this.name,
    this.imageUrl,
    this.parentCatId,
    this.urlSlug,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'],
      name: json['category_name'],
      imageUrl: json['image_url'],
      parentCatId: json['parent_cat_id'],
      urlSlug: json['url_slug'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category_name': name,
      'image_url': imageUrl,
      'parent_cat_id': parentCatId,
      'url_slug': urlSlug,
    };
  }
}
