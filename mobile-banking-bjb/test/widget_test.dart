import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_banking_bjb/main.dart';

void main() {
  testWidgets('Bank bjb app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const BankBjbApp());
    await tester.pump();
    expect(find.byType(BankBjbApp), findsOneWidget);
  });
}
