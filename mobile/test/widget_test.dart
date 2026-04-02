import 'package:flutter_test/flutter_test.dart';

import 'package:cop4331_mobile/main.dart';

void main() {
  testWidgets('Login screen shows headline', (WidgetTester tester) async {
    await tester.pumpWidget(const Cop4331MobileApp());
    await tester.pumpAndSettle();

    expect(find.text('Welcome Back'), findsOneWidget);
  });
}
