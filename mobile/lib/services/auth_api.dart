import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config.dart';
import 'auth_client_stub.dart'
    if (dart.library.io) 'auth_client_io.dart'
    if (dart.library.html) 'auth_client_web.dart';

/// Ceiling for the whole request. When the network and server are fine, login
/// finishes in under a second; this only caps how long we wait before failing.
const Duration _kRequestTimeout = Duration(seconds: 18);

const String _kNetworkUnreachableHelp =
    'Could not reach the server.\n\n'
    '• Open Chrome **inside the emulator** and load your API base URL '
    '(e.g. https://largeproj.msilvacop4331.site).\n'
    '• Cold boot the AVD (Device Manager → ▼ → Cold Boot) or try a **physical phone**.\n'
    '• Disable VPN; allow the emulator through Windows Firewall.\n'
    '• Local Node on your PC: '
    'flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api\n'
    '  (use your real port; 10.0.2.2 is the emulator’s name for your PC.)';

class AuthApiException implements Exception {
  AuthApiException(this.message, {this.statusCode});
  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class AuthApi {
  AuthApi({http.Client? client}) : _client = client ?? createAuthHttpClient();

  final http.Client _client;

  Uri _uri(String path) {
    final base = kApiBaseUrl.endsWith('/')
        ? kApiBaseUrl.substring(0, kApiBaseUrl.length - 1)
        : kApiBaseUrl;
    final p = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$base$p');
  }

  /// Browser-like agent — some APIs/WAFs treat non-browser clients differently than desktop Chrome.
  static const Map<String, String> _headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent':
        'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 StudyBuddy/1',
  };

  Future<http.Response> _postJson(String path, Map<String, dynamic> body) async {
    try {
      return await _client
          .post(
            _uri(path),
            headers: _headers,
            body: jsonEncode(body),
          )
          .timeout(_kRequestTimeout);
    } on TimeoutException {
      throw AuthApiException(_kNetworkUnreachableHelp);
    } catch (e) {
      final s = e.toString();
      if (s.contains('connection timed out') ||
          s.contains('Connection timed out') ||
          s.contains('SocketException') ||
          s.contains('timed out')) {
        throw AuthApiException(_kNetworkUnreachableHelp);
      }
      if (s.contains('Failed host lookup') ||
          s.contains('Network is unreachable')) {
        throw AuthApiException('Network error: $s');
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final res = await _postJson('/auth/login', {
      'email': email.trim(),
      'password': password,
    });
    final body = _decodeJson(res);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return body;
    }
    throw AuthApiException(
      body['message']?.toString() ?? 'Login failed',
      statusCode: res.statusCode,
    );
  }

  Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    final res = await _postJson('/auth/register', {
      'firstName': firstName.trim(),
      'lastName': lastName.trim(),
      'email': email.trim(),
      'password': password,
    });
    final body = _decodeJson(res);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return body;
    }
    throw AuthApiException(
      body['message']?.toString() ?? 'Registration failed',
      statusCode: res.statusCode,
    );
  }

  Map<String, dynamic> _decodeJson(http.Response res) {
    try {
      final decoded = jsonDecode(res.body);
      if (decoded is Map<String, dynamic>) return decoded;
      return {'message': res.body};
    } catch (_) {
      return {'message': res.body.isEmpty ? 'Unexpected response' : res.body};
    }
  }
}
