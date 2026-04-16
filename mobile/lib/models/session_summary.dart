class SessionSummary {
  const SessionSummary({
    required this.id,
    required this.subject,
    this.courseName = '',
    required this.location,
    required this.time,
    required this.hostName,
    required this.userId,
    this.isJoined = false,
    this.participants,
  });

  final String id;
  final String subject;
  final String courseName;
  final String location;
  final String time;
  final String hostName;
  final String userId;
  final bool isJoined;
  final List<dynamic>? participants;

  factory SessionSummary.fromJson(Map<String, dynamic> json) {
    return SessionSummary(
      id: _id(json['_id'] ?? json['id']),
      subject: json['subject']?.toString() ?? '',
      courseName: json['courseName']?.toString() ?? '',
      location: json['location']?.toString() ?? '',
      time: json['time']?.toString() ?? '',
      hostName: json['hostName']?.toString() ?? '',
      userId: _id(json['userId']),
      isJoined: json['isJoined'] == true,
      participants: json['participants'] as List<dynamic>?,
    );
  }

  static String _id(dynamic v) {
    if (v == null) return '';
    if (v is String) return v;
    if (v is Map && v[r'$oid'] != null) return v[r'$oid'].toString();
    return v.toString();
  }

  SessionSummary copyWith({
    bool? isJoined,
    List<dynamic>? participants,
  }) {
    return SessionSummary(
      id: id,
      subject: subject,
      courseName: courseName,
      location: location,
      time: time,
      hostName: hostName,
      userId: userId,
      isJoined: isJoined ?? this.isJoined,
      participants: participants ?? this.participants,
    );
  }
}
