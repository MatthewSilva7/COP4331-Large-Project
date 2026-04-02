import 'package:flutter/material.dart';

import '../theme/study_buddy_theme.dart';
import 'study_buddy_brand_icon.dart';

/// Centered cream background, brand icon + title above a white rounded card.
class StudyBuddyAuthShell extends StatelessWidget {
  const StudyBuddyAuthShell({
    super.key,
    required this.headline,
    required this.subtitle,
    required this.cardChild,
    this.showBack = false,
    this.footerBelowCard,
  });

  final String headline;
  final String subtitle;
  final Widget cardChild;
  final bool showBack;
  final Widget? footerBelowCard;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: StudyBuddyTheme.cream,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (showBack)
                    Align(
                      alignment: Alignment.centerLeft,
                      child: IconButton(
                        onPressed: () => Navigator.of(context).maybePop(),
                        icon: const Icon(
                          Icons.arrow_back_ios_new_rounded,
                          color: StudyBuddyTheme.olive,
                          size: 20,
                        ),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(
                          minWidth: 40,
                          minHeight: 40,
                        ),
                      ),
                    ),
                  const SizedBox(height: 8),
                  const Center(child: StudyBuddyBrandIcon()),
                  const SizedBox(height: 22),
                  Text(
                    headline,
                    textAlign: TextAlign.center,
                    style: StudyBuddyTheme.titleLarge(context),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    subtitle,
                    textAlign: TextAlign.center,
                    style: StudyBuddyTheme.subtitleItalic(context),
                  ),
                  const SizedBox(height: 28),
                  Material(
                    color: Colors.white,
                    elevation: 6,
                    shadowColor: Colors.black26,
                    borderRadius: BorderRadius.circular(22),
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(22, 26, 22, 22),
                      child: cardChild,
                    ),
                  ),
                  if (footerBelowCard != null) ...[
                    const SizedBox(height: 20),
                    footerBelowCard!,
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
