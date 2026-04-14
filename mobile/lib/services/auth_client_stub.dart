import 'package:http/http.dart' as http;

/// Fallback when neither `dart.library.io` nor `dart.library.html` applies.
http.Client createAuthHttpClient() => http.Client();
