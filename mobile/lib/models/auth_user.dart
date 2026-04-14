import 'dart:convert';

class CourseEntry {
  const CourseEntry({required this.subject, required this.number});

  final String subject;
  final String number;

  Map<String, dynamic> toJson() => {'subject': subject, 'number': number};

  static CourseEntry? fromJson(dynamic e) {
    if (e is! Map) return null;
    return CourseEntry(
      subject: e['subject']?.toString() ?? '',
      number: e['number']?.toString() ?? '',
    );
  }
}

class AuthUser {
  const AuthUser({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.major,
    this.courses,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? major;
  final List<CourseEntry>? courses;

  static String _parseId(dynamic v) {
    if (v == null) return '';
    if (v is String) return v;
    if (v is Map && v[r'$oid'] != null) return v[r'$oid'].toString();
    return v.toString();
  }

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    final coursesRaw = json['courses'];
    List<CourseEntry>? courses;
    if (coursesRaw is List) {
      courses = coursesRaw
          .map((e) => CourseEntry.fromJson(e))
          .whereType<CourseEntry>()
          .toList();
    }
    return AuthUser(
      id: _parseId(json['id'] ?? json['_id']),
      firstName: json['firstName']?.toString() ?? '',
      lastName: json['lastName']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      major: json['major']?.toString(),
      courses: courses,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        if (major != null) 'major': major,
        if (courses != null)
          'courses': courses!.map((c) => c.toJson()).toList(),
      };

  AuthUser copyWith({
    String? firstName,
    String? lastName,
    String? email,
    String? major,
    List<CourseEntry>? courses,
  }) {
    return AuthUser(
      id: id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      major: major ?? this.major,
      courses: courses ?? this.courses,
    );
  }

  static AuthUser? decodeStored(String? raw) {
    if (raw == null || raw.isEmpty) return null;
    try {
      return AuthUser.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }
}
