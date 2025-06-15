// lib/models/place_model.dart
class Place {
  final int id;
  final int userId; // user_id с бэкенда
  final String name;
  final String? description;
  final double latitude;
  final double longitude;
  final DateTime createdAt;
  final String? createdBy; // username создателя

  Place({
    required this.id,
    required this.userId,
    required this.name,
    this.description,
    required this.latitude,
    required this.longitude,
    required this.createdAt,
    this.createdBy,
  });

  factory Place.fromJson(Map<String, dynamic> json) {
    return Place(
      id: json['id'],
      userId: json['user_id'], // Убедитесь, что бэкенд возвращает user_id
      name: json['name'] ?? 'Без названия',
      description: json['description'],
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      createdAt: DateTime.parse(json['created_at']),
      createdBy: json['created_by'],
    );
  }
}