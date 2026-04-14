import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:cop4331_mobile/screens/login_screen.dart';
import 'package:cop4331_mobile/theme/study_buddy_theme.dart';

void main() {
  testWidgets('Login screen shows headline', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: ThemeData(
          useMaterial3: true,
          scaffoldBackgroundColor: StudyBuddyTheme.cream,
        ),
        home: const LoginScreen(),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Welcome Back'), findsOneWidget);
  });
}
