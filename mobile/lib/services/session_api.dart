import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config.dart';
import '../models/session_summary.dart';
import 'api_headers.dart';
import 'auth_client_stub.dart'
    if (dart.library.io) 'auth_client_io.dart'
    if (dart.library.html) 'auth_client_web.dart';

class SessionApiException implements Exception {
  SessionApiException(this.message);
  final String message;

  @override
  String toString() => message;
}

/// Session + search routes on the same `/api` base as auth (see `server/index.js`).
class SessionApi {
  SessionApi({http.Client? client}) : _client = client ?? createAuthHttpClient();

  final http.Client _client;

  Uri _uri(String path) {
    final base = kApiBaseUrl.endsWith('/')
        ? kApiBaseUrl.substring(0, kApiBaseUrl.length - 1)
        : kApiBaseUrl;
    final p = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$base$p');
  }

  Future<List<SessionSummary>> getUserSessions(String userId) async {
    final res = await _client.get(
      _uri('/sessions/user/$userId'),
      headers: ApiHeaders.json(),
    );
    final body = _decode(res);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final list = body['sessions'] as List<dynamic>? ?? [];
      return list
          .map((e) => SessionSummary.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    }
    throw SessionApiException(body['message']?.toString() ?? 'Could not load sessions');
  }

  Future<List<SessionSummary>> getAvailableSessions(String userId) async {
    final res = await _client.get(
      _uri('/sessions/available/$userId'),
      headers: ApiHeaders.json(),
    );
    final body = _decode(res);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final list = body['sessions'] as List<dynamic>? ?? [];
      return list
          .map((e) => SessionSummary.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    }
    throw SessionApiException(
      body['message']?.toString() ?? 'Could not load available sessions',
    );
  }

  Future<List<SessionSummary>> searchSessions(String query, String? excludeUserId) async {
    final q = query.trim();
    if (q.isEmpty) return [];
    final params = <String, String>{'q': q};
    if (excludeUserId != null && excludeUserId.isNotEmpty) {
      params['excludeUserId'] = excludeUserId;
    }
    final uri = _uri('/search/sessions').replace(queryParameters: params);
    final res = await _client.get(uri, headers: ApiHeaders.json());
    final body = _decode(res);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final list = body['sessions'] as List<dynamic>? ?? [];
      return list
          .map((e) => SessionSummary.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    }
    throw SessionApiException(body['message']?.toString() ?? 'Search failed');
  }

  Future<SessionSummary> createSession({
    required String subject,
    required String location,
    required String time,
    required String hostName,
    required String userId,
  }) async {
    final res = await _client.post(
      _uri('/sessions/create'),
      headers: ApiHeaders.json(),
      body: jsonEncode({
        'subject': subject,
        'location': location,
        'time': time,
        'hostName': hostName,
        'userId': userId,
      }),
    );
    final body = _decode(res);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final s = body['session'];
      if (s is Map) {
        return SessionSummary.fromJson(Map<String, dynamic>.from(s));
      }
    }
    throw SessionApiException(body['message']?.toString() ?? 'Could not create session');
  }

  Future<void> joinSession({
    required String sessionId,
    required String userId,
  }) async {
    final res = await _client.post(
      _uri('/sessions/join'),
      headers: ApiHeaders.json(),
      body: jsonEncode({'sessionId': sessionId, 'userId': userId}),
    );
    final body = _decode(res);
    if (res.statusCode >= 200 && res.statusCode < 300) return;
    throw SessionApiException(body['message']?.toString() ?? 'Could not join');
  }

  Future<void> leaveSession({
    required String sessionId,
    required String userId,
  }) async {
    final res = await _client.post(
      _uri('/sessions/leave'),
      headers: ApiHeaders.json(),
      body: jsonEncode({'sessionId': sessionId, 'userId': userId}),
    );
    final body = _decode(res);
    if (res.statusCode >= 200 && res.statusCode < 300) return;
    throw SessionApiException(body['message']?.toString() ?? 'Could not leave');
  }

  Future<void> deleteSession({
    required String sessionId,
    required String userId,
  }) async {
    final res = await _client.delete(
      _uri('/sessions/$sessionId'),
      headers: ApiHeaders.json(),
      body: jsonEncode({'userId': userId}),
    );
    final body = _decode(res);
    if (res.statusCode >= 200 && res.statusCode < 300) return;
    throw SessionApiException(body['message']?.toString() ?? 'Could not delete session');
  }

  Map<String, dynamic> _decode(http.Response res) {
    try {
      final decoded = jsonDecode(res.body);
      if (decoded is Map<String, dynamic>) return decoded;
      return {'message': res.body};
    } catch (_) {
      return {'message': res.body.isEmpty ? 'Unexpected response' : res.body};
    }
  }
}
