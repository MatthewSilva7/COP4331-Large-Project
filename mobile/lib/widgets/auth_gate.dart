import 'package:flutter/material.dart';

import '../models/auth_user.dart';
import '../services/user_storage.dart';
import '../theme/study_buddy_theme.dart';
import '../screens/dashboard_screen.dart';
import '../screens/login_screen.dart';

/// Shows dashboard when a token + user exist in storage (like web `App.tsx`).
class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  Future<AuthUser?>? _session;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    setState(() {
      _session = UserStorage.restoreSession();
    });
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<AuthUser?>(
      future: _session,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return Scaffold(
            backgroundColor: StudyBuddyTheme.cream,
            body: Center(
              child: CircularProgressIndicator(color: StudyBuddyTheme.olive),
            ),
          );
        }
        final user = snapshot.data;
        if (user != null) {
          return DashboardScreen(
            key: ValueKey<String>(user.id),
            user: user,
            onLogout: () async {
              await UserStorage.clear();
              _reload();
            },
          );
        }
        return LoginScreen(onLoggedIn: _reload);
      },
    );
  }
}
