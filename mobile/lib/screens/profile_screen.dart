import 'package:flutter/material.dart';

import '../models/auth_user.dart';
import '../services/user_storage.dart';
import '../theme/study_buddy_theme.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({
    super.key,
    required this.user,
    required this.onLogout,
  });

  final AuthUser user;
  final Future<void> Function() onLogout;

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _CourseRow {
  _CourseRow({required this.id, required this.subject, required this.number});

  final String id;
  final TextEditingController subject;
  final TextEditingController number;
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _first;
  late TextEditingController _last;
  late TextEditingController _email;
  late TextEditingController _major;
  late List<_CourseRow> _courses;
  String _error = '';

  @override
  void initState() {
    super.initState();
    final u = widget.user;
    _first = TextEditingController(text: u.firstName);
    _last = TextEditingController(text: u.lastName);
    _email = TextEditingController(text: u.email);
    _major = TextEditingController(text: u.major ?? '');
    final list = u.courses;
    if (list != null && list.isNotEmpty) {
      _courses = list
          .map(
            (c) => _CourseRow(
              id: UniqueKey().toString(),
              subject: TextEditingController(text: c.subject),
              number: TextEditingController(text: c.number),
            ),
          )
          .toList();
    } else {
      _courses = [
        _CourseRow(
          id: '1',
          subject: TextEditingController(),
          number: TextEditingController(),
        ),
      ];
    }
  }

  @override
  void dispose() {
    _first.dispose();
    _last.dispose();
    _email.dispose();
    _major.dispose();
    for (final c in _courses) {
      c.subject.dispose();
      c.number.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _error = '');
    if (!_formKey.currentState!.validate()) return;

    final fn = _first.text.trim();
    final ln = _last.text.trim();
    final em = _email.text.trim();
    if (fn.isEmpty || ln.isEmpty || em.isEmpty) {
      setState(() => _error = 'First name, last name, and email are required.');
      return;
    }

    final normalized = <CourseEntry>[];
    for (final c in _courses) {
      final sub = c.subject.text.trim().toUpperCase();
      final num = c.number.text.trim();
      if (sub.isEmpty && num.isEmpty) continue;
      if (!RegExp(r'^[A-Z]{3}$').hasMatch(sub) || !RegExp(r'^\d{4}$').hasMatch(num)) {
        setState(
          () => _error = 'Each course must use a 3-letter subject and a 4-digit number.',
        );
        return;
      }
      normalized.add(CourseEntry(subject: sub, number: num));
    }

    final updated = widget.user.copyWith(
      firstName: fn,
      lastName: ln,
      email: em,
      major: _major.text.trim(),
      courses: normalized.isEmpty ? [] : normalized,
    );

    await UserStorage.persistProfile(updated);
    if (!mounted) return;
    Navigator.pop(context, updated);
  }

  Future<void> _confirmLogout() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Log out?'),
          content: const Text('You will need to sign in again to use Study Buddy.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Log out'),
            ),
          ],
        );
      },
    );
    if (ok != true || !mounted) return;
    Navigator.pop(context);
    await widget.onLogout();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: StudyBuddyTheme.cream,
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: StudyBuddyTheme.cream,
        foregroundColor: StudyBuddyTheme.charcoal,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Log out',
            onPressed: _confirmLogout,
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  '${widget.user.firstName} ${widget.user.lastName}',
                  style: StudyBuddyTheme.titleLarge(context),
                ),
                const SizedBox(height: 8),
                Text(
                  'Keep your account details in one place.',
                  style: StudyBuddyTheme.subtitleItalic(context),
                ),
                const SizedBox(height: 24),
                _field('First name', _first),
                _field('Last name', _last),
                _field('Email', _email, keyboard: TextInputType.emailAddress),
                _field('Major', _major),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Courses', style: StudyBuddyTheme.labelCaps(context)),
                    TextButton(
                      onPressed: () {
                        setState(() {
                          _courses.add(
                            _CourseRow(
                              id: UniqueKey().toString(),
                              subject: TextEditingController(),
                              number: TextEditingController(),
                            ),
                          );
                        });
                      },
                      child: const Text('Add course'),
                    ),
                  ],
                ),
                ..._courses.asMap().entries.map((e) {
                  final i = e.key;
                  final row = e.value;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: row.subject,
                            decoration: StudyBuddyTheme.pillInputDecoration(
                              hintText: 'COP',
                            ),
                            textCapitalization: TextCapitalization.characters,
                            maxLength: 3,
                            style: StudyBuddyTheme.bodySerif(context),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextFormField(
                            controller: row.number,
                            decoration: StudyBuddyTheme.pillInputDecoration(
                              hintText: '4331',
                            ),
                            keyboardType: TextInputType.number,
                            maxLength: 4,
                            style: StudyBuddyTheme.bodySerif(context),
                          ),
                        ),
                        IconButton(
                          onPressed: () {
                            if (_courses.length == 1) {
                              row.subject.clear();
                              row.number.clear();
                            } else {
                              setState(() {
                                row.subject.dispose();
                                row.number.dispose();
                                _courses.removeAt(i);
                              });
                            }
                          },
                          icon: const Icon(Icons.close),
                        ),
                      ],
                    ),
                  );
                }),
                if (_error.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Text(_error, style: const TextStyle(color: Colors.red)),
                  ),
                FilledButton(
                  style: StudyBuddyTheme.primaryPillButton(),
                  onPressed: _save,
                  child: const Text('Save profile'),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () async {
                    Navigator.pop(context);
                  },
                  child: const Text('Back to dashboard'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _field(
    String label,
    TextEditingController c, {
    TextInputType keyboard = TextInputType.text,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: StudyBuddyTheme.labelCaps(context)),
          const SizedBox(height: 8),
          TextFormField(
            controller: c,
            decoration: StudyBuddyTheme.pillInputDecoration(),
            keyboardType: keyboard,
            style: StudyBuddyTheme.bodySerif(context),
          ),
        ],
      ),
    );
  }
}
