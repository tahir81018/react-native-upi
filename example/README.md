# Example App for @tahir810/react-native-upi

This directory contains a complete, runnable test application featuring a **single test Pay button** to verify UPI native intent payments.

## Features
- **One-Click UPI Test:** Prominent "Pay with UPI" button that triggers Android's `startActivityForResult` via system chooser or Google Pay.
- **Real-time Status Banner:** Displays transaction status, Txn ID, and Approval Reference Code.
- **Configurable VPA:** Optional toggle to test with custom merchant VPA and amount.

## How to Run with Expo

1. **Install dependencies:**
   ```bash
   cd example
   npm install
   ```

2. **Generate the Android native project:**
   ```bash
   npx expo prebuild --platform android
   ```

3. **Run on an Android device:**
   ```bash
   npx expo run:android
   ```
