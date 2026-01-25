class AddressModel {
  final String? id;
  final String name;
  final String mobile;
  final String flatHouse;
  final String areaLocality;
  final String city;
  final String state;
  final String pincode;
  final bool isDefault;

  AddressModel({
    this.id,
    required this.name,
    required this.mobile,
    required this.flatHouse,
    required this.areaLocality,
    required this.city,
    required this.state,
    required this.pincode,
    this.isDefault = false,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: json['id'],
      name: json['name'] ?? '',
      mobile: json['mobile'] ?? '',
      flatHouse: json['flatHouse'] ?? '',
      areaLocality: json['areaLocality'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      pincode: json['pincode'] ?? '',
      isDefault: json['isDefault'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'mobile': mobile,
      'flatHouse': flatHouse,
      'areaLocality': areaLocality,
      'city': city,
      'state': state,
      'pincode': pincode,
      'isDefault': isDefault,
    };
  }

  String get fullAddress => "$flatHouse, $areaLocality, $city, $state - $pincode";
}
