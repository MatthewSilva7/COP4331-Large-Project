import 'package:flutter/material.dart';

import '../services/auth_api.dart';
import '../theme/study_buddy_theme.dart';
import '../widgets/study_buddy_auth_shell.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _api = AuthApi();
  bool _loading = false;
  bool _rememberMe = false;
  String _message = '';
  bool _messageIsError = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _message = '';
    });
    try {
      final data = await _api.login(
        email: _email.text,
        password: _password.text,
      );
      if (!mounted) return;
      final user = data['user'];
      String welcome = 'Logged in successfully.';
      if (user is Map && user['firstName'] != null) {
        welcome = 'Welcome, ${user['firstName']}!';
      }
      setState(() {
        _message = welcome;
        _messageIsError = false;
      });
    } on AuthApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _message = e.message;
        _messageIsError = true;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _message = 'Error: $e';
        _messageIsError = true;
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Widget _capsLabel(String text) {
    return Text(
      text.toUpperCase(),
      style: StudyBuddyTheme.labelCaps(context),
    );
  }

  @override
  Widget build(BuildContext context) {
    return StudyBuddyAuthShell(
      headline: 'Welcome Back',
      subtitle: 'Your study sessions are waiting for you.',
      showBack: false,
      cardChild: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_message.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: StudyBuddyTheme.messageBanner(_messageIsError),
                child: Text(
                  _message,
                  style: StudyBuddyTheme.bodySerif(context).copyWith(
                    fontSize: 13,
                    color: _messageIsError
                        ? const Color(0xFF8B2E2E)
                        : StudyBuddyTheme.charcoal,
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
            _capsLabel('Email address'),
            const SizedBox(height: 10),
            TextFormField(
              controller: _email,
              decoration: StudyBuddyTheme.pillInputDecoration(),
              keyboardType: TextInputType.emailAddress,
              autocorrect: false,
              textInputAction: TextInputAction.next,
              style: StudyBuddyTheme.bodySerif(context),
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Enter email';
                return null;
              },
            ),
            const SizedBox(height: 18),
            _capsLabel('Password'),
            const SizedBox(height: 10),
            TextFormField(
              controller: _password,
              decoration: StudyBuddyTheme.pillInputDecoration(),
              obscureText: true,
              textInputAction: TextInputAction.done,
              style: StudyBuddyTheme.bodySerif(context),
              onFieldSubmitted: (_) => _submit(),
              validator: (v) {
                if (v == null || v.isEmpty) return 'Enter password';
                return null;
              },
            ),
            const SizedBox(height: 14),
            Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              alignment: WrapAlignment.spaceBetween,
              spacing: 12,
              runSpacing: 8,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      height: 40,
                      width: 40,
                      child: Theme(
                        data: Theme.of(context).copyWith(
                          checkboxTheme: CheckboxThemeData(
                            fillColor: WidgetStateProperty.resolveWith((states) {
                              if (states.contains(WidgetState.selected)) {
                                return StudyBuddyTheme.olive;
                              }
                              return null;
                            }),
                            side: const BorderSide(
                              color: StudyBuddyTheme.border,
                              width: 1.5,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                        child: Checkbox(
                          value: _rememberMe,
                          onChanged: _loading
                              ? null
                              : (v) => setState(() => _rememberMe = v ?? false),
                        ),
                      ),
                    ),
                    Text(
                      'Remember me',
                      style:
                          StudyBuddyTheme.bodySerif(context).copyWith(fontSize: 13),
                    ),
                  ],
                ),
                TextButton(
                  onPressed: _loading
                      ? null
                      : () => Navigator.pushNamed(context, '/forgot'),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: Text(
                    'Forgot your password?',
                    style: StudyBuddyTheme.linkUnderlined(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 22),
            FilledButton(
              style: StudyBuddyTheme.primaryPillButton(),
              onPressed: _loading ? null : _submit,
              child: _loading
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Sign in'),
            ),
            const SizedBox(height: 22),
            Center(
              child: Wrap(
                crossAxisAlignment: WrapCrossAlignment.center,
                alignment: WrapAlignment.center,
                children: [
                  Text(
                    "Don't have an account? ",
                    style: StudyBuddyTheme.bodySerif(context).copyWith(
                      color: StudyBuddyTheme.muted,
                      fontSize: 13,
                    ),
                  ),
                  InkWell(
                    onTap: _loading
                        ? null
                        : () => Navigator.pushNamed(context, '/register'),
                    child: Text(
                      'Register here',
                      style: StudyBuddyTheme.linkUnderlined(),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
