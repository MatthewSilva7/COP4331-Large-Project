/// Shared headers for auth + session APIs (matches web `fetch` behavior).
abstract final class ApiHeaders {
  static Map<String, String> json() => const {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent':
            'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 StudyBuddy/1',
      };
}
