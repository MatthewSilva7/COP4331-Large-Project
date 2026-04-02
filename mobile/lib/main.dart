import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'screens/forgot_password_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'theme/study_buddy_theme.dart';

void main() {
  runApp(const Cop4331MobileApp());
}

class Cop4331MobileApp extends StatelessWidget {
  const Cop4331MobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: StudyBuddyTheme.cream,
      colorScheme: ColorScheme.light(
        primary: StudyBuddyTheme.olive,
        onPrimary: Colors.white,
        surface: Colors.white,
        onSurface: StudyBuddyTheme.charcoal,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: StudyBuddyTheme.cream,
        foregroundColor: StudyBuddyTheme.olive,
        elevation: 0,
        titleTextStyle: GoogleFonts.playfairDisplay(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: StudyBuddyTheme.charcoal,
        ),
      ),
    );

    return MaterialApp(
      title: 'Study Buddy',
      theme: base,
      initialRoute: '/',
      routes: {
        '/': (_) => const LoginScreen(),
        '/register': (_) => const RegisterScreen(),
        '/forgot': (_) => const ForgotPasswordScreen(),
      },
    );
  }
}
