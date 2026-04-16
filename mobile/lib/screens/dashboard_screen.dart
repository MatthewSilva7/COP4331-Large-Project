import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

import '../models/auth_user.dart';
import '../models/session_summary.dart';
import '../services/session_api.dart';
import '../theme/study_buddy_theme.dart';
import 'profile_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({
    super.key,
    required this.user,
    required this.onLogout,
  });

  final AuthUser user;
  final Future<void> Function() onLogout;

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _sessionApi = SessionApi();
  final _searchController = TextEditingController();

  late AuthUser _user;
  List<SessionSummary> _hosted = [];
  List<SessionSummary> _available = [];
  List<SessionSummary> _joined = [];
  List<SessionSummary> _searchResults = [];

  bool _loading = true;
  String _error = '';
  bool _searching = false;
  String _joiningId = '';
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _user = widget.user;
    _load();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final hosted = await _sessionApi.getUserSessions(_user.id);
      final available = await _sessionApi.getAvailableSessions(_user.id);
      final filtered = available.where((s) => s.userId != _user.id).toList();
      setState(() {
        _hosted = hosted;
        _available = filtered;
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    final q = value.trim();
    if (q.isEmpty) {
      setState(() {
        _searchResults = [];
        _searching = false;
      });
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 300), () async {
      try {
        if (!mounted) return;
        setState(() => _searching = true);
        final r = await _sessionApi.searchSessions(q, _user.id);
        if (!mounted) return;
        setState(() => _searchResults = r);
      } catch (_) {
        if (mounted) setState(() => _searchResults = []);
      } finally {
        if (mounted) setState(() => _searching = false);
      }
    });
  }

  double _timeSort(SessionSummary s) {
    final raw = s.time.replaceAll(' at ', ' ');
    final d = DateTime.tryParse(raw);
    return d?.millisecondsSinceEpoch.toDouble() ?? 0;
  }

  List<SessionSummary> get _mySchedule {
    final list = [..._hosted, ..._joined];
    list.sort((a, b) => _timeSort(a).compareTo(_timeSort(b)));
    return list;
  }

  List<SessionSummary> get _displayJoin {
    final q = _searchController.text.trim();
    return q.isNotEmpty ? _searchResults : _available;
  }

  Future<void> _join(SessionSummary session) async {
    setState(() => _joiningId = session.id);
    try {
      await _sessionApi.joinSession(sessionId: session.id, userId: _user.id);
      final me = {
        'firstName': _user.firstName,
        'lastName': _user.lastName,
        '_id': _user.id,
      };
      final joined = session.copyWith(
        isJoined: true,
        participants: [...?session.participants, me],
      );
      setState(() {
        _available = _available.where((s) => s.id != session.id).toList();
        _searchResults = _searchResults.where((s) => s.id != session.id).toList();
        _joined = [..._joined, joined];
      });
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not join.')),
        );
      }
    } finally {
      if (mounted) setState(() => _joiningId = '');
    }
  }

  Future<void> _leave(SessionSummary session) async {
    try {
      await _sessionApi.leaveSession(sessionId: session.id, userId: _user.id);
      setState(() {
        _joined = _joined.where((s) => s.id != session.id).toList();
        _available = [
          ..._available,
          session.copyWith(isJoined: false),
        ];
      });
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not leave group.')),
        );
      }
    }
  }

  Future<void> _delete(SessionSummary session) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Session'),
        content: const Text(
            'Delete this study session permanently? This cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await _sessionApi.deleteSession(
          sessionId: session.id, userId: _user.id);
      setState(() {
        _hosted = _hosted.where((s) => s.id != session.id).toList();
      });
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not delete session.')),
        );
      }
    }
  }

  Future<void> _showSessionActions(SessionSummary s) async {
    final isHost = _isHost(s) && !s.isJoined;
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      backgroundColor: const Color(0xFFFCFAF4),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 6, 12, 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(4, 8, 4, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s.subject,
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                      ),
                      if (s.courseName.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          s.courseName,
                          style: const TextStyle(
                            color: Color(0xFF665F4A),
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                      const SizedBox(height: 6),
                      Text(
                        s.time,
                        style: const TextStyle(color: Color(0xFF6D654F), fontSize: 12.5),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),
                if (isHost)
                  ListTile(
                    leading: const Icon(Icons.edit),
                    title: const Text('Edit session'),
                    onTap: () async {
                      Navigator.pop(ctx);
                      await _showSessionFormDialog(editing: s);
                    },
                  ),
                if (s.isJoined)
                  ListTile(
                    leading: const Icon(Icons.exit_to_app, color: Colors.red),
                    title: const Text('Leave group'),
                    textColor: Colors.red,
                    iconColor: Colors.red,
                    onTap: () async {
                      Navigator.pop(ctx);
                      await _leave(s);
                    },
                  ),
                if (isHost)
                  ListTile(
                    leading: const Icon(Icons.delete, color: Colors.red),
                    title: const Text('Delete session'),
                    textColor: Colors.red,
                    iconColor: Colors.red,
                    onTap: () async {
                      Navigator.pop(ctx);
                      await _delete(s);
                    },
                  ),
                const SizedBox(height: 6),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _openProfile() async {
    final updated = await Navigator.push<AuthUser>(
      context,
      MaterialPageRoute(
        builder: (_) => ProfileScreen(
          user: _user,
          onLogout: widget.onLogout,
        ),
      ),
    );
    if (updated != null && mounted) {
      setState(() => _user = updated);
    }
  }

  Future<void> _showParticipants(SessionSummary s) async {
    await showDialog<void>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(s.subject, style: StudyBuddyTheme.titleMedium(context)),
              if (s.courseName.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  s.courseName,
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF665F4A),
                  ),
                ),
              ],
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Attendees', style: TextStyle(color: Colors.grey[600])),
                const SizedBox(height: 8),
                ListTile(
                  leading: CircleAvatar(
                    backgroundColor: StudyBuddyTheme.olive,
                    child: Text(
                      s.hostName.isNotEmpty ? s.hostName[0].toUpperCase() : 'H',
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                  title: Text('${s.hostName} (Host)'),
                ),
                ...(s.participants ?? []).map<Widget>((p) {
                  if (p is! Map) return const SizedBox.shrink();
                  final m = Map<String, dynamic>.from(p);
                  final fn = m['firstName']?.toString() ?? '';
                  final ln = m['lastName']?.toString() ?? '';
                  final id = m['_id']?.toString() ?? '';
                  final you = id == _user.id;
                  return ListTile(
                    title: Text('$fn $ln${you ? ' (You)' : ''}'),
                  );
                }),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
          ],
        );
      },
    );
  }

  Future<void> _showHostDialog() async {
    await _showSessionFormDialog();
  }

  bool _isHost(SessionSummary s) => s.userId == _user.id;

  Widget _statusChip(SessionSummary s) {
    final joined = s.isJoined;
    final host = _isHost(s) && !joined;
    final label = joined ? 'JOINED' : (host ? 'HOST' : '');
    if (label.isEmpty) return const SizedBox.shrink();

    final bg = joined ? const Color(0xFFDDEBFF) : const Color(0xFFF2EFE6);
    final fg = joined ? const Color(0xFF1F5FA8) : const Color(0xFF665F4A);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: fg.withOpacity(0.18)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.8,
          color: fg,
        ),
      ),
    );
  }

  ({String subject, String number, String professor}) _parseSubjectParts(String subject) {
    final match = RegExp(r'^([a-zA-Z]+)\s+(\d+)\s+-\s+Prof\.\s+(.*)$').firstMatch(subject.trim());
    if (match != null) {
      return (subject: match.group(1) ?? '', number: match.group(2) ?? '', professor: match.group(3) ?? '');
    }
    final sub = subject.trim();
    return (
      subject: sub.length >= 3 ? sub.substring(0, 3) : sub,
      number: '',
      professor: sub,
    );
  }

  ({String dateIso, String time24}) _parseSessionTimeParts(String displayTime) {
    final raw = displayTime.trim();
    if (!raw.contains(',')) return (dateIso: '', time24: '');
    final parts = raw.split(',');
    if (parts.length < 2) return (dateIso: '', time24: '');
    final datePart = parts[0].trim(); // e.g. "Apr 2"
    final timePart = parts.sublist(1).join(',').trim(); // robust if commas appear

    String dateIso = '';
    try {
      final year = DateTime.now().year;
      final d = DateFormat('MMM d yyyy').parseStrict('$datePart $year');
      dateIso =
          '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    } catch (_) {
      dateIso = '';
    }

    String time24 = '';
    try {
      final t = timePart.toUpperCase().contains('AM') || timePart.toUpperCase().contains('PM')
          ? DateFormat('h:mm a').parseStrict(timePart)
          : DateFormat('HH:mm').parseStrict(timePart);
      time24 = '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      time24 = '';
    }

    return (dateIso: dateIso, time24: time24);
  }

  Future<void> _showSessionFormDialog({SessionSummary? editing}) async {
    final courseSubject = TextEditingController();
    final courseNumber = TextEditingController();
    final courseFullTitle = TextEditingController();
    final professor = TextEditingController();
    final location = TextEditingController();
    final dateDisplay = TextEditingController();
    final timeDisplay = TextEditingController();
    var sessionDate = '';
    var sessionTime = '';
    var submitting = false;
    String? formError;
    String? subjectError;
    String? numberError;
    String? courseNameError;
    String? professorError;
    String? locationError;
    String? dateError;
    String? timeError;

    if (editing != null) {
      final parsed = _parseSubjectParts(editing.subject);
      courseSubject.text = parsed.subject;
      courseNumber.text = parsed.number;
      courseFullTitle.text = editing.courseName;
      professor.text = parsed.professor;
      location.text = editing.location;

      final t = _parseSessionTimeParts(editing.time);
      sessionDate = t.dateIso;
      sessionTime = t.time24;
      dateDisplay.text = sessionDate;
      timeDisplay.text = sessionTime;
    }

    await showDialog<void>(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setLocal) {
            InputDecoration _fieldDecoration(
              String label, {
              String? hint,
              Widget? suffixIcon,
            }) {
              return InputDecoration(
                labelText: label,
                hintText: hint,
                filled: true,
                fillColor: const Color(0xFFF8F4EC),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFFD8D0BF)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFFD8D0BF)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: Color(0xFF5A5A40), width: 1.6),
                ),
                suffixIcon: suffixIcon,
              );
            }

            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
              insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              titlePadding: const EdgeInsets.fromLTRB(24, 22, 24, 4),
              contentPadding: const EdgeInsets.fromLTRB(24, 8, 24, 8),
              actionsPadding: const EdgeInsets.fromLTRB(20, 4, 20, 16),
              title: Text(
                editing == null ? 'Host a Session' : 'Edit Session',
                style: StudyBuddyTheme.titleMedium(context),
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: courseSubject,
                            maxLength: 3,
                            inputFormatters: [
                              FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z]')),
                            ],
                            textCapitalization: TextCapitalization.characters,
                            decoration: _fieldDecoration(
                              'Subject',
                              hint: 'COP',
                            ).copyWith(
                              counterText: '',
                              helperText: '3 letters',
                              helperStyle: const TextStyle(
                                fontSize: 11,
                                color: Color(0xFF8A826B),
                              ),
                              errorText: subjectError,
                            ),
                            onChanged: (v) {
                              final u = v.toUpperCase();
                              if (u != v) {
                                courseSubject.value = courseSubject.value.copyWith(
                                  text: u,
                                  selection: TextSelection.collapsed(offset: u.length),
                                );
                              }
                              if (subjectError != null || formError != null) {
                                setLocal(() {
                                  subjectError = null;
                                  formError = null;
                                });
                              }
                            },
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: courseNumber,
                            maxLength: 4,
                            keyboardType: TextInputType.number,
                            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                            decoration: _fieldDecoration(
                              'Course number',
                              hint: '4331',
                            ).copyWith(
                              counterText: '',
                              helperText: '4 digits',
                              helperStyle: const TextStyle(
                                fontSize: 11,
                                color: Color(0xFF8A826B),
                              ),
                              errorText: numberError,
                            ),
                            onChanged: (_) {
                              if (numberError != null || formError != null) {
                                setLocal(() {
                                  numberError = null;
                                  formError = null;
                                });
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: courseFullTitle,
                      decoration: _fieldDecoration(
                        'Full course name',
                        hint: 'e.g. Biology 1',
                      ).copyWith(errorText: courseNameError),
                      onChanged: (_) {
                        if (courseNameError != null || formError != null) {
                          setLocal(() {
                            courseNameError = null;
                            formError = null;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: professor,
                      decoration: _fieldDecoration(
                        'Professor last name',
                        hint: 'Zhu',
                      ).copyWith(errorText: professorError),
                      onChanged: (_) {
                        if (professorError != null || formError != null) {
                          setLocal(() {
                            professorError = null;
                            formError = null;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: location,
                      decoration: _fieldDecoration(
                        'Location',
                        hint: 'John T. Washington 205',
                      ).copyWith(errorText: locationError),
                      onChanged: (_) {
                        if (locationError != null || formError != null) {
                          setLocal(() {
                            locationError = null;
                            formError = null;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: dateDisplay,
                            readOnly: true,
                            decoration: _fieldDecoration(
                              'Date',
                              hint: 'Select date',
                              suffixIcon:
                                  const Icon(Icons.calendar_today_outlined, size: 18),
                            ).copyWith(errorText: dateError),
                            onTap: () async {
                              final now = DateTime.now();
                              DateTime initialDate = now;
                              if (sessionDate.isNotEmpty) {
                                initialDate =
                                    DateTime.tryParse('${sessionDate}T12:00:00') ?? now;
                              }
                              final d = await showDatePicker(
                                context: context,
                                initialDate: initialDate,
                                firstDate: now,
                                lastDate: now.add(const Duration(days: 365)),
                              );
                              if (d != null) {
                                sessionDate =
                                    '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
                                dateDisplay.text = sessionDate;
                                setLocal(() {
                                  dateError = null;
                                  formError = null;
                                });
                              }
                            },
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: timeDisplay,
                            readOnly: true,
                            decoration: _fieldDecoration(
                              'Time',
                              hint: 'Select time',
                              suffixIcon: const Icon(Icons.access_time, size: 18),
                            ).copyWith(errorText: timeError),
                            onTap: () async {
                              final initial = sessionTime.isNotEmpty
                                  ? () {
                                      final p = sessionTime.split(':');
                                      final h = int.tryParse(p.isNotEmpty ? p[0] : '') ??
                                          TimeOfDay.now().hour;
                                      final m = int.tryParse(p.length > 1 ? p[1] : '') ??
                                          TimeOfDay.now().minute;
                                      return TimeOfDay(hour: h, minute: m);
                                    }()
                                  : TimeOfDay.now();
                              final t = await showTimePicker(
                                context: context,
                                initialTime: initial,
                              );
                              if (t != null) {
                                sessionTime =
                                    '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
                                timeDisplay.text = sessionTime;
                                setLocal(() {
                                  timeError = null;
                                  formError = null;
                                });
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    if (formError != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        formError!,
                        style: const TextStyle(
                          color: Colors.red,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              actions: [
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: submitting ? null : () => Navigator.pop(ctx),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(999),
                          ),
                          side: const BorderSide(color: Color(0xFFB9AF9B)),
                          foregroundColor: const Color(0xFF3A3529),
                        ),
                        child: const Text('Cancel'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(
                        onPressed: submitting
                            ? null
                            : () async {
                                final subjOk = courseSubject.text.trim().length == 3;
                                final numOk = courseNumber.text.trim().length == 4;
                                final nameOk = courseFullTitle.text.trim().isNotEmpty;
                                final profOk = professor.text.trim().isNotEmpty;
                                final locOk = location.text.trim().isNotEmpty;
                                final dateOk = sessionDate.isNotEmpty;
                                final timeOk = sessionTime.isNotEmpty;

                                if (!(subjOk && numOk && nameOk && profOk && locOk && dateOk && timeOk)) {
                                  setLocal(() {
                                    subjectError = subjOk ? null : 'Required';
                                    numberError = numOk ? null : 'Required';
                                    courseNameError = nameOk ? null : 'Required';
                                    professorError = profOk ? null : 'Required';
                                    locationError = locOk ? null : 'Required';
                                    dateError = dateOk ? null : 'Required';
                                    timeError = timeOk ? null : 'Required';
                                    formError = 'Please fill in all required fields.';
                                  });
                                  return;
                                }
                                setLocal(() => submitting = true);
                                final formattedSubject =
                                    '${courseSubject.text.toUpperCase()} ${courseNumber.text} - Prof. ${professor.text.trim()}';
                                final dt = DateTime.tryParse('${sessionDate}T12:00:00');
                                final displayTime = dt != null
                                    ? '${DateFormat.MMMd().format(dt)}, $sessionTime'
                                    : sessionTime;
                                try {
                                  if (editing != null) {
                                    await _sessionApi.updateSession(
                                      sessionId: editing.id,
                                      subject: formattedSubject,
                                      courseName: courseFullTitle.text.trim(),
                                      location: location.text.trim(),
                                      time: displayTime,
                                      userId: _user.id,
                                    );
                                  } else {
                                    await _sessionApi.createSession(
                                      subject: formattedSubject,
                                      courseName: courseFullTitle.text.trim(),
                                      location: location.text.trim(),
                                      time: displayTime,
                                      hostName: '${_user.firstName} ${_user.lastName}',
                                      userId: _user.id,
                                    );
                                  }
                                  if (ctx.mounted) Navigator.pop(ctx);
                                  await _load();
                                } catch (e) {
                                  if (ctx.mounted) {
                                    ScaffoldMessenger.of(ctx).showSnackBar(
                                      SnackBar(content: Text(e.toString())),
                                    );
                                  }
                                } finally {
                                  if (context.mounted) setLocal(() => submitting = false);
                                }
                              },
                        style: FilledButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(999),
                          ),
                          backgroundColor: StudyBuddyTheme.olive,
                          foregroundColor: Colors.white,
                        ),
                        child: Text(editing == null ? 'Create' : 'Save'),
                      ),
                    ),
                  ],
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: StudyBuddyTheme.cream,
      body: RefreshIndicator(
        onRefresh: _load,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 48, 16, 16),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(28),
                    gradient: const LinearGradient(
                      colors: [Color(0xFFF6F1E7), Color(0xFFE4DBC6)],
                    ),
                    border: Border.all(color: const Color(0xFFD9D5C7)),
                    boxShadow: const [
                      BoxShadow(color: Colors.black12, blurRadius: 12, offset: Offset(0, 4)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'STUDY BUDDY DASHBOARD',
                        style: StudyBuddyTheme.labelCaps(context),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Welcome back, ${_user.firstName}.',
                        style: StudyBuddyTheme.titleLarge(context),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          FilledButton(
                            // `StudyBuddyTheme.primaryPillButton()` is full-width (infinite minWidth),
                            // which breaks when placed inside a Row. Use a compact variant here.
                            style: FilledButton.styleFrom(
                              backgroundColor: StudyBuddyTheme.olive,
                              foregroundColor: Colors.white,
                              minimumSize: const Size(0, 52),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 18,
                                vertical: 14,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(28),
                              ),
                            ),
                            onPressed: _showHostDialog,
                            child: const Text('Host a Session'),
                          ),
                          const SizedBox(width: 12),
                          OutlinedButton(
                            onPressed: _openProfile,
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size(0, 52),
                              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                              side: const BorderSide(color: Color(0xFF8A826B), width: 1.2),
                              foregroundColor: const Color(0xFF3A3529),
                            ),
                            child: const Text('Profile'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            if (_loading)
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Center(child: CircularProgressIndicator()),
                ),
              ),
            if (_error.isNotEmpty)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Text(_error, style: const TextStyle(color: Colors.red)),
                ),
              ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: _section(
                  'Your Schedule',
                  _mySchedule.isEmpty
                      ? const Text('Nothing scheduled yet.', style: TextStyle(color: Colors.grey))
                      : Column(
                          children: _mySchedule
                              .map(
                                (s) => Padding(
                                  padding: const EdgeInsets.only(bottom: 16),
                                  child: _sessionTile(
                                    s,
                                    onTap: () => _showParticipants(s),
                                    badge: _statusChip(s),
                                    trailing: IconButton(
                                      tooltip: 'Actions',
                                      visualDensity: VisualDensity.compact,
                                      onPressed: () => _showSessionActions(s),
                                      icon: const Icon(Icons.more_horiz),
                                      color: const Color(0xFF665F4A),
                                    ),
                                  ),
                                ),
                              )
                              .toList(),
                        ),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: _section(
                  'Join a Session',
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      TextField(
                        controller: _searchController,
                        onChanged: _onSearchChanged,
                        decoration: StudyBuddyTheme.pillInputDecoration(
                          hintText: 'Search subjects, host, location…',
                        ),
                      ),
                      const SizedBox(height: 12),
                      if (_searching) const LinearProgressIndicator(minHeight: 2),
                      const SizedBox(height: 8),
                      ..._displayJoin.map(
                        (s) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: _sessionTile(
                                  s,
                                  onTap: () => _showParticipants(s),
                                ),
                              ),
                              FilledButton(
                                onPressed: _joiningId == s.id ? null : () => _join(s),
                                child: _joiningId == s.id
                                    ? const SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(strokeWidth: 2),
                                      )
                                    : const Text('Join'),
                              ),
                            ],
                          ),
                        ),
                      ),
                      if (!_searching && _displayJoin.isEmpty)
                        Text(
                          _searchController.text.trim().isEmpty
                              ? 'No sessions available right now.'
                              : 'No sessions matched your search.',
                          style: const TextStyle(color: Colors.grey),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _section(String title, Widget child) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFCFAF4),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE6DFD0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: StudyBuddyTheme.titleMedium(context)),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _sessionTile(
    SessionSummary s, {
    VoidCallback? onTap,
    Widget? badge,
    Widget? trailing,
  }) {
    final inner = Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      s.subject,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    if (s.courseName.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        s.courseName,
                        style: const TextStyle(
                          fontSize: 11.5,
                          color: Color(0xFF665F4A),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (badge != null || trailing != null)
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (badge != null) badge,
                    if (badge != null && trailing != null) const SizedBox(width: 6),
                    if (trailing != null) trailing,
                  ],
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            s.time,
            style: const TextStyle(
              color: Color(0xFF6D654F),
              fontSize: 12.5,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            '📍 ${s.location}',
            style: const TextStyle(
              fontSize: 12.5,
              color: Color(0xFF5F5946),
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            'Hosted by ${s.hostName}',
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF5F5946),
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
    if (onTap != null) {
      return InkWell(onTap: onTap, child: inner);
    }
    return inner;
  }
}
