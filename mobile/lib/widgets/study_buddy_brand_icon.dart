import 'package:flutter/material.dart';

import '../theme/study_buddy_theme.dart';

/// Rounded square with book icon (brand mark from mockups).
class StudyBuddyBrandIcon extends StatelessWidget {
  const StudyBuddyBrandIcon({super.key, this.size = 56});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: StudyBuddyTheme.olive,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: StudyBuddyTheme.olive.withValues(alpha: 0.35),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Icon(
        Icons.menu_book_rounded,
        color: Colors.white,
        size: size * 0.45,
      ),
    );
  }
}
