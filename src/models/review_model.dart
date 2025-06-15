// lib/models/review_model.dart
class Review {
  final int id;
  final int rating;
  final String? comment;
  final DateTime createdAt;
  final String? createdByUsername;

  Review({
    required this.id,
    required this.rating,
    this.comment,
    required this.createdAt,
    this.createdByUsername,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'],
      rating: json['rating'],
      comment: json['comment'],
      createdAt: DateTime.parse(json['created_at']),
      createdByUsername: json['created_by_username'],
    );
  }
}