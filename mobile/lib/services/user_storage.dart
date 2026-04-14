import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/auth_user.dart';

const _kToken = 'auth_token';
const _kUser = 'auth_user';

String _profileKey(String userId) => 'profile:$userId';

/// Persists JWT + user JSON (mirrors web `localStorage` usage).
class UserStorage {
  UserStorage._();

  static Future<void> saveAuth({
    required String token,
    required Map<String, dynamic> userJson,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kToken, token);
    await prefs.setString(_kUser, jsonEncode(userJson));
    final u = AuthUser.fromJson(userJson);
    await _mergeStoredProfile(prefs, u);
  }

  static Future<void> _mergeStoredProfile(
    SharedPreferences prefs,
    AuthUser base,
  ) async {
    final raw = prefs.getString(_profileKey(base.id));
    if (raw == null) return;
    try {
      final map = jsonDecode(raw) as Map<String, dynamic>;
      final major = map['major']?.toString();
      final coursesRaw = map['courses'];
      List<CourseEntry>? courses;
      if (coursesRaw is List) {
        courses = coursesRaw
            .map((e) => CourseEntry.fromJson(e))
            .whereType<CourseEntry>()
            .toList();
      }
      final merged = base.copyWith(
        major: major ?? base.major,
        courses: courses ?? base.courses,
      );
      await prefs.setString(_kUser, jsonEncode(merged.toJson()));
    } catch (_) {}
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kToken);
  }

  static Future<AuthUser?> loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kUser);
    final u = AuthUser.decodeStored(raw);
    if (u == null) return null;
    return _hydrateProfile(prefs, u);
  }

  static Future<AuthUser?> restoreSession() async {
    final token = await getToken();
    if (token == null || token.isEmpty) return null;
    return loadUser();
  }

  static Future<AuthUser> _hydrateProfile(
    SharedPreferences prefs,
    AuthUser base,
  ) async {
    final raw = prefs.getString(_profileKey(base.id));
    if (raw == null) return base;
    try {
      final map = jsonDecode(raw) as Map<String, dynamic>;
      final major = map['major']?.toString();
      final coursesRaw = map['courses'];
      List<CourseEntry>? courses;
      if (coursesRaw is List) {
        courses = coursesRaw
            .map((e) => CourseEntry.fromJson(e))
            .whereType<CourseEntry>()
            .toList();
      }
      return base.copyWith(
        major: major ?? base.major,
        courses: courses ?? base.courses,
      );
    } catch (_) {
      return base;
    }
  }

  static Future<void> persistProfile(AuthUser user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kUser, jsonEncode(user.toJson()));
    await prefs.setString(
      _profileKey(user.id),
      jsonEncode({
        'major': user.major ?? '',
        'courses': (user.courses ?? [])
            .map((c) => c.toJson())
            .toList(),
      }),
    );
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kToken);
    await prefs.remove(_kUser);
  }
}
