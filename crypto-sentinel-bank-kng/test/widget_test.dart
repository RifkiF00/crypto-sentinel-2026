// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:bank_kuningan/core/constants/strings.dart';
import 'package:bank_kuningan/main.dart';

void main() {
  testWidgets('Bank Kuningan app smoke test', (WidgetTester tester) async {
    // Set screen size for testing
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    // Build our app and trigger a frame.
    await tester.pumpWidget(const BankKuninganApp());
    await tester.pumpAndSettle();

    // Verify that login screen renders
    expect(find.text(AppStrings.loginButton), findsOneWidget);
  });
}
