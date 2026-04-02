import 'package:flutter/material.dart';

import '../services/auth_api.dart';
import '../theme/study_buddy_theme.dart';
import '../widgets/study_buddy_auth_shell.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _api = AuthApi();
  bool _loading = false;
  String _message = '';

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
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
      await _api.register(
        firstName: _firstName.text,
        lastName: _lastName.text,
        email: _email.text,
        password: _password.text,
      );
      if (!mounted) return;
      Navigator.pop(context);
    } on AuthApiException catch (e) {
      if (!mounted) return;
      setState(() => _message = e.message);
    } catch (e) {
      if (!mounted) return;
      setState(() => _message = 'Error: $e');
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
      headline: 'Join Study Buddy',
      subtitle: 'Start your collaborative learning journey today.',
      showBack: true,
      cardChild: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_message.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: StudyBuddyTheme.messageBanner(true),
                child: Text(
                  _message,
                  style: StudyBuddyTheme.bodySerif(context).copyWith(
                    fontSize: 13,
                    color: const Color(0xFF8B2E2E),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _capsLabel('First name'),
                      const SizedBox(height: 10),
                      TextFormField(
                        controller: _firstName,
                        decoration: StudyBuddyTheme.pillInputDecoration(),
                        textCapitalization: TextCapitalization.words,
                        textInputAction: TextInputAction.next,
                        style: StudyBuddyTheme.bodySerif(context),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'Required';
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _capsLabel('Last name'),
                      const SizedBox(height: 10),
                      TextFormField(
                        controller: _lastName,
                        decoration: StudyBuddyTheme.pillInputDecoration(),
                        textCapitalization: TextCapitalization.words,
                        textInputAction: TextInputAction.next,
                        style: StudyBuddyTheme.bodySerif(context),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'Required';
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
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
                if (v == null || v.trim().isEmpty) return 'Required';
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
                if (v == null || v.isEmpty) return 'Required';
                return null;
              },
            ),
            const SizedBox(height: 18),
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
                  : const Text('Create account'),
            ),
            const SizedBox(height: 22),
            Center(
              child: Wrap(
                crossAxisAlignment: WrapCrossAlignment.center,
                alignment: WrapAlignment.center,
                children: [
                  Text(
                    'Already have an account? ',
                    style: StudyBuddyTheme.bodySerif(context).copyWith(
                      color: StudyBuddyTheme.muted,
                      fontSize: 13,
                    ),
                  ),
                  InkWell(
                    onTap: _loading
                        ? null
                        : () => Navigator.pop(context),
                    child: Text(
                      'Sign in here',
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
