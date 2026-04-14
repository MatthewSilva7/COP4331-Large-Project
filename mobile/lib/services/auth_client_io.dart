import 'dart:io';

import 'package:cronet_http/cronet_http.dart';
import 'package:flutter/foundation.dart' show TargetPlatform, defaultTargetPlatform, kIsWeb;
import 'package:http/http.dart' as http;
import 'package:http/io_client.dart';

/// On **Android**, use Cronet (same networking stack as Chrome). Dart’s
/// [HttpClient] often hits connection timeouts on emulators while desktop
/// Chrome works. On iOS / desktop, use [IOClient] with explicit timeouts.
http.Client createAuthHttpClient() {
  if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
    return CronetClient.defaultCronetEngine();
  }

  final inner = HttpClient()
    ..connectionTimeout = const Duration(seconds: 12)
    ..idleTimeout = const Duration(seconds: 15)
    ..autoUncompress = true;
  return IOClient(inner);
}
