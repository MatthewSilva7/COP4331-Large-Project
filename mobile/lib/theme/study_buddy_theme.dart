import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Study Buddy — dark academia palette (matches web mockups).
abstract final class StudyBuddyTheme {
  static const Color olive = Color(0xFF555843);
  static const Color cream = Color(0xFFF9F8F5);
  static const Color charcoal = Color(0xFF1A1A1A);
  static const Color muted = Color(0xFF6B6B6B);
  static const Color inputFill = Color(0xFFFAFAF8);
  static const Color border = Color(0xFFE0DED8);

  static TextStyle titleLarge(BuildContext context) {
    return GoogleFonts.playfairDisplay(
      fontSize: 28,
      fontWeight: FontWeight.w600,
      color: charcoal,
      height: 1.2,
    );
  }

  static TextStyle titleMedium(BuildContext context) {
    return GoogleFonts.playfairDisplay(
      fontSize: 24,
      fontWeight: FontWeight.w600,
      color: charcoal,
      height: 1.2,
    );
  }

  static TextStyle subtitleItalic(BuildContext context) {
    return GoogleFonts.playfairDisplay(
      fontSize: 15,
      fontStyle: FontStyle.italic,
      fontWeight: FontWeight.w400,
      color: muted,
      height: 1.4,
    );
  }

  /// Small caps labels: "EMAIL ADDRESS"
  static TextStyle labelCaps(BuildContext context) {
    return GoogleFonts.merriweather(
      fontSize: 11,
      fontWeight: FontWeight.w600,
      letterSpacing: 1.0,
      color: olive,
      height: 1.2,
    );
  }

  static TextStyle bodySerif(BuildContext context) {
    return GoogleFonts.merriweather(
      fontSize: 14,
      color: charcoal,
      height: 1.4,
    );
  }

  static TextStyle linkUnderlined({Color? color}) {
    return GoogleFonts.merriweather(
      fontSize: 14,
      color: color ?? olive,
      decoration: TextDecoration.underline,
      decorationColor: color ?? olive,
    );
  }

  static TextStyle helperItalic() {
    return GoogleFonts.merriweather(
      fontSize: 13,
      fontStyle: FontStyle.italic,
      color: muted,
      height: 1.45,
    );
  }

  static InputDecoration pillInputDecoration({
    String? hintText,
  }) {
    OutlineInputBorder outline(Color c, {double w = 1}) => OutlineInputBorder(
          borderRadius: BorderRadius.circular(28),
          borderSide: BorderSide(color: c, width: w),
        );

    return InputDecoration(
      hintText: hintText,
      filled: true,
      fillColor: inputFill,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      border: outline(border),
      enabledBorder: outline(border),
      focusedBorder: outline(olive, w: 1.5),
      errorBorder: outline(Colors.red.shade300),
      focusedErrorBorder: outline(Colors.red.shade700),
    );
  }

  static ButtonStyle primaryPillButton() {
    return FilledButton.styleFrom(
      backgroundColor: olive,
      foregroundColor: Colors.white,
      disabledBackgroundColor: olive.withValues(alpha: 0.5),
      minimumSize: const Size.fromHeight(52),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      textStyle: GoogleFonts.merriweather(
        fontSize: 16,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  static BoxDecoration messageBanner(bool isError) {
    return BoxDecoration(
      color: isError ? const Color(0xFFFFF5F5) : const Color(0xFFF5F3EE),
      border: Border.all(
        color: isError ? const Color(0xFFE8D4D4) : const Color(0xFFE8E4DC),
      ),
      borderRadius: BorderRadius.circular(12),
    );
  }
}
