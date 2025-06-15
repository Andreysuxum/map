// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart'; // Для токена
import '../models/place_model.dart'; // Путь к вашей модели

class ApiService {
  final String _baseUrl = "https://ba8ac31196b0.hosting.myjino.ru/"; // ЗАМЕНИТЕ НА ВАШ АКТУАЛЬНЫЙ URL БЭКЕНДА
  final _storage = FlutterSecureStorage();

  Future<String?> _getToken() async {
    return await _storage.read(key: 'auth_token');
  }

  // --- МЕТОДЫ ДЛЯ МЕТОК ---

  // Создание новой метки
  Future<Place> createPlace({
    required String name,
    String? description,
    required double latitude,
    required double longitude,
  }) async {
    final token = await _getToken();
    if (token == null) {
      throw Exception('Authentication token not found. Please login.');
    }

    final response = await http.post(
      Uri.parse('$_baseUrl/places'),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(<String, dynamic>{
        'name': name,
        'description': description,
        'latitude': latitude,
        'longitude': longitude,
      }),
    );

    if (response.statusCode == 201) { // 201 Created
      // Если бэкенд возвращает кириллицу, важно правильно декодировать
      final responseBody = utf8.decode(response.bodyBytes);
      return Place.fromJson(jsonDecode(responseBody));
    } else {
      print('Failed to create place: ${response.statusCode} ${response.body}');
      throw Exception('Failed to create place. Status: ${response.statusCode}');
    }
  }

  // Получение всех меток (публичный эндпоинт или с токеном, если защищен)
  Future<List<Place>> getAllPlaces() async {
    // Если эндпоинт GET /api/places защищен, нужно будет передавать токен
    // final token = await _getToken();
    final response = await http.get(
      Uri.parse('$_baseUrl/places'),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        // if (token != null) 'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> body = jsonDecode(utf8.decode(response.bodyBytes));
      return body.map((dynamic item) => Place.fromJson(item)).toList();
    } else {
      print('Failed to load places: ${response.statusCode} ${response.body}');
      throw Exception('Failed to load places. Status: ${response.statusCode}');
    }
  }

  // Получение меток текущего пользователя
  Future<List<Place>> getMyPlaces() async {
    final token = await _getToken();
    if (token == null) {
      throw Exception('Authentication token not found. Please login.');
    }

    final response = await http.get(
      Uri.parse('$_baseUrl/places/my-places'),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> body = jsonDecode(utf8.decode(response.bodyBytes));
      return body.map((dynamic item) => Place.fromJson(item)).toList();
    } else {
      print('Failed to load my places: ${response.statusCode} ${response.body}');
      throw Exception('Failed to load my places. Status: ${response.statusCode}');
    }
  }
  // ... (другие методы, например, для аутентификации, если они здесь)
}