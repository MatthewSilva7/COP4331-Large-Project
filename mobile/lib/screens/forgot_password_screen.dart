import 'package:flutter/material.dart';

import '../theme/study_buddy_theme.dart';
import '../widgets/study_buddy_auth_shell.dart';

/// UI matches web reset-password mockup (no backend route yet).
class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _email = TextEditingController();

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  void _submit() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Password reset is not wired to the API yet.',
          style: StudyBuddyTheme.bodySerif(context).copyWith(color: Colors.white),
        ),
        backgroundColor: StudyBuddyTheme.olive,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return StudyBuddyAuthShell(
      headline: 'Reset Password',
      subtitle: "We'll help you get back into your account.",
      showBack: true,
      cardChild: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'EMAIL ADDRESS',
            style: StudyBuddyTheme.labelCaps(context),
          ),
          const SizedBox(height: 10),
          TextFormField(
            controller: _email,
            decoration: StudyBuddyTheme.pillInputDecoration(),
            keyboardType: TextInputType.emailAddress,
            autocorrect: false,
            style: StudyBuddyTheme.bodySerif(context),
          ),
          const SizedBox(height: 12),
          Text(
            "Enter your email and we'll send you a link to reset your password.",
            style: StudyBuddyTheme.helperItalic(),
          ),
          const SizedBox(height: 22),
          FilledButton(
            style: StudyBuddyTheme.primaryPillButton(),
            onPressed: _submit,
            child: const Text('Send reset link'),
          ),
          const SizedBox(height: 20),
          Center(
            child: InkWell(
              onTap: () => Navigator.pop(context),
              child: Text(
                '← Back to sign in',
                style: StudyBuddyTheme.linkUnderlined(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
