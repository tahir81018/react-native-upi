# Example App for react-native-upi

This directory demonstrates how to use `react-native-upi` in a React Native application.

### Key features shown in `App.tsx`:
1. Direct 5-argument method (`startPayment(...)`) matching the user prompt.
2. Structured payment with options (`initiatePayment(...)`) returning parsed status, transaction ID, and approval code.
3. System Chooser dialog (`UPI_APPS.CHOOSER`) allowing the user to pick any UPI app on the device.
4. Discovering installed UPI apps (`getInstalledUPIApps()`).

To test in your own React Native project, you can copy `App.tsx` directly into your project root.
