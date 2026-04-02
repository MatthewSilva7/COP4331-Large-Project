// Base URL for the Express API (`/api/auth/...`). Override with:
//   flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api

const String kApiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'https://largeproj.msilvacop4331.site/api',
);
