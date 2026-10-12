# @tahir810/react-native-upi 💳

> **A clean, complete, and zero-dependency React Native package for Android UPI payments using Native Intent (`startActivityForResult`).**
> 
> A complete and modern solution for implementing UPI payments in React Native using Android Native Modules and `ActivityEventListener` without any external third-party SDK dependencies.

---

## 🌟 Features

- ⚡ **100% Native Intent Implementation:** Uses native `startActivityForResult` with `ActivityEventListener` to listen for real-time payment results.
- 🛡️ **Zero External SDKs:** No third-party payment gateway SDK required—full control in your hands.
- 🎯 **All UPI Apps Supported:** Works with Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay, or opens the native Android UPI Chooser.
- 📦 **Automatic Response Parsing:** Automatically parses the raw UPI response string (`txnId`, `responseCode`, `ApprovalRefNo`, `Status`, `txnRef`) into a clean, strongly-typed JavaScript object.
- 📱 **UPI App Detection:** Query installed UPI apps on the user's device (`getInstalledUPIApps()`).
- 🔒 **Android 11+ Ready:** Includes pre-configured `<queries>` in `AndroidManifest.xml` for package visibility on Android 11, 12, 13, 14, and 15.
- 🔗 **React Native Autolinking:** Automatically links on React Native 0.60+ (no manual Java code editing required).
- 📘 **Full TypeScript Support:** Complete TypeScript declarations and type safety out of the box.

---

## 📥 Installation

```bash
# Using npm:
npm install @tahir810/react-native-upi

# Using yarn:
yarn add @tahir810/react-native-upi
```

---

## ⚙️ Android Configuration

### 1. Autolinking
On React Native 0.60 and above, this package is **automatically linked**. No manual configuration is required!

### 2. Manual Linking (If needed)
For older React Native versions or custom project setups where autolinking is disabled:

1. Add to `android/settings.gradle`:
```groovy
include ':@tahir810_react-native-upi'
project(':@tahir810_react-native-upi').projectDir = new File(rootProject.projectDir, '../node_modules/@tahir810/react-native-upi/android')
```

2. Add to dependencies in `android/app/build.gradle`:
```groovy
dependencies {
    implementation project(':@tahir810_react-native-upi')
}
```

3. Add to `MainApplication.java` (or `MainApplication.kt`):
```java
import com.reactnativeupi.UPIPaymentPackage;

// Inside getPackages() method:
packages.add(new UPIPaymentPackage());
```

---

## 🚀 Usage

### 1. Simple Usage (Direct 5 Arguments)
You can directly invoke the payment method with standard parameters:

```typescript
import React from 'react';
import { View, Button, Alert, Platform } from 'react-native';
import { startPayment } from '@tahir810/react-native-upi';

export default function PaymentScreen() {
  const makePayment = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Error', 'UPI payments are only supported on Android devices.');
      return;
    }

    try {
      // 5-argument method (defaults to Google Pay)
      const rawResponse = await startPayment(
        'your-merchant-vpa@okhdfcbank', // pa: Merchant UPI VPA
        'Merchant Name',                 // pn: Payee Name
        '1.00',                          // am: Amount
        'TXN' + Date.now(),              // tr: Transaction Reference ID
        'Payment for Order #101'         // tn: Transaction Note
      );

      console.log('Google Pay Response:', rawResponse);
      Alert.alert('Payment Response', rawResponse);

    } catch (error: any) {
      console.error('Payment Failed:', error.message);
      Alert.alert('Payment Error', error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button title="Pay ₹1.00 with Google Pay" onPress={makePayment} />
    </View>
  );
}
```

---

### 2. Modern Structured API (`initiatePayment`)
Pass a structured configuration object to pay via Google Pay, PhonePe, Paytm, or the system Chooser dialog, and receive a parsed response object:

```typescript
import { initiatePayment, isPaymentSuccessful, UPI_APPS } from '@tahir810/react-native-upi';

const handlePayment = async () => {
  try {
    const result = await initiatePayment({
      vpa: 'merchant@upi',
      name: 'My Store',
      amount: '250.00',
      txnRef: 'TXN_' + Date.now(),
      note: 'Grocery Order',
      // Target specific app or use CHOOSER:
      packageName: UPI_APPS.PHONEPE, // or UPI_APPS.GOOGLE_PAY / UPI_APPS.PAYTM / UPI_APPS.CHOOSER
    });

    console.log('Status:', result.status);             // 'SUCCESS' | 'FAILURE' | 'SUBMITTED'
    console.log('Transaction ID:', result.txnId);      // e.g. 'UPI123456789'
    console.log('Approval Ref No:', result.approvalRefNo);
    console.log('Raw Response:', result.rawResponse);

    if (isPaymentSuccessful(result)) {
      alert(`Payment Successful! Transaction ID: ${result.txnId}`);
    } else {
      alert(`Payment Status: ${result.status}`);
    }
  } catch (error: any) {
    alert(`Payment Cancelled or Failed: ${error.message}`);
  }
};
```

---

### 3. Query Installed UPI Apps (`getInstalledUPIApps`)
Discover all installed UPI apps on the device to render a dynamic payment app selector:

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getInstalledUPIApps, initiatePayment, InstalledUPIApp } from '@tahir810/react-native-upi';

export function UPIAppSelector() {
  const [apps, setApps] = useState<InstalledUPIApp[]>([]);

  useEffect(() => {
    getInstalledUPIApps().then(setApps).catch(console.error);
  }, []);

  const payWithApp = async (packageName: string) => {
    const res = await initiatePayment({
      vpa: 'merchant@upi',
      name: 'Merchant',
      amount: '10.00',
      txnRef: 'TXN' + Date.now(),
      packageName,
    });
    console.log(res);
  };

  return (
    <View>
      <Text>Select an app to pay:</Text>
      {apps.map((app) => (
        <TouchableOpacity key={app.packageName} onPress={() => payWithApp(app.packageName)}>
          <Text>{app.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

---

## 📖 API Reference

### Method Signatures

#### `startPayment(...)`
```typescript
// 1. Five/Six argument signature (returns raw string):
startPayment(
  vpa: string,
  name: string,
  amount: string,
  txnRef: string,
  note: string,
  packageName?: string
): Promise<string>

// 2. Structured configuration signature (returns parsed object):
startPayment(config: UPIPaymentConfig): Promise<UPIPaymentResponse>
```

#### `initiatePayment(config: UPIPaymentConfig): Promise<UPIPaymentResponse>`
Takes configuration object and returns parsed `UPIPaymentResponse`.

#### `getInstalledUPIApps(): Promise<InstalledUPIApp[]>`
Returns an array of installed UPI apps: `[{ name: 'Google Pay', packageName: 'com.google.android.apps.nbu.paisa.user' }, ...]`.

#### `isAppInstalled(packageName: string): Promise<boolean>`
Returns `true` if the specified package is installed on the device.

#### `parseUPIResponse(rawResponse: string): UPIPaymentResponse`
Utility function to parse any raw UPI response query string into a structured object.

#### `isPaymentSuccessful(response: UPIPaymentResponse | string): boolean`
Helper function returning `true` if the payment status is `'SUCCESS'`.

---

### `UPIPaymentConfig` Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `vpa` | `string` | **Yes** | Virtual Payment Address / UPI ID (e.g., `merchant@upi`) |
| `name` | `string` | **Yes** | Payee / Merchant Name (e.g., `Store Name`) |
| `amount` | `string` | **Yes** | Transaction amount as decimal string (e.g., `1.00`, `250.50`) |
| `txnRef` | `string` | **Yes** | Unique merchant transaction reference ID |
| `note` | `string` | No | Transaction description / note (e.g., `Order #101`) |
| `currency` | `string` | No | Currency code. Default: `'INR'` |
| `packageName` | `string` | No | Specific package name or `'CHOOSER'`. Default: Chooser or GPay |
| `merchantCode` | `string` | No | Merchant Category Code (MCC) |
| `url` | `string` | No | Transaction reference URL |
| `mode` | `string` | No | Transaction Mode (e.g. `'00'` for default, `'02'` for QR) |
| `orgid` | `string` | No | Bank or Partner Org ID for verified routing |

---

### `UPIPaymentResponse` Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `status` | `'SUCCESS' \| 'FAILURE' \| 'SUBMITTED' \| string` | Normalized status of the payment |
| `txnId` | `string \| undefined` | Unique transaction ID generated by UPI gateway |
| `txnRef` | `string \| undefined` | Transaction reference passed in request |
| `responseCode` | `string \| undefined` | Bank response code (e.g., `'0'` or `'00'` for success) |
| `approvalRefNo` | `string \| undefined` | Bank Approval reference number |
| `rawResponse` | `string` | Complete raw response string returned by native Intent |

---

### Predefined Constants

#### `UPI_APPS`
```typescript
import { UPI_APPS } from '@tahir810/react-native-upi';

UPI_APPS.GOOGLE_PAY   // 'com.google.android.apps.nbu.paisa.user'
UPI_APPS.PHONEPE      // 'com.phonepe.app'
UPI_APPS.PAYTM        // 'net.one97.paytm'
UPI_APPS.BHIM         // 'in.org.npci.upiapp'
UPI_APPS.CRED         // 'com.dreamplug.androidapp'
UPI_APPS.AMAZON_PAY   // 'in.amazon.mShop.android.shopping'
UPI_APPS.CHOOSER      // 'CHOOSER' (Opens native system chooser)
```

#### `UPI_ERROR_CODES`
```typescript
import { UPI_ERROR_CODES } from '@tahir810/react-native-upi';

UPI_ERROR_CODES.PAYMENT_CANCELLED        // 'PAYMENT_CANCELLED'
UPI_ERROR_CODES.APP_NOT_INSTALLED        // 'APP_NOT_INSTALLED'
UPI_ERROR_CODES.ACTIVITY_DOES_NOT_EXIST  // 'ACTIVITY_DOES_NOT_EXIST'
UPI_ERROR_CODES.NOT_SUPPORTED_PLATFORM   // 'NOT_SUPPORTED_PLATFORM'
UPI_ERROR_CODES.INVALID_PARAMS           // 'INVALID_PARAMS'
```

---

## 🔍 How It Works Under The Hood

1. **Native Intent Creation:** A standard Android Intent is constructed using the `upi://pay` URI scheme with NPCI-compliant payment parameters.
2. **Activity Request:** Android's `currentActivity.startActivityForResult(intent, 123)` is called to launch the chosen UPI app (Google Pay, PhonePe, etc.) or system chooser dialog.
3. **Result Listener:** React Native's `ActivityEventListener` listens to `onActivityResult` to capture the payment transaction result from the UPI app.
4. **Promise Resolution:** The raw response string returned by the payment application is resolved or rejected back to the JavaScript Promise.
5. **Automatic Fallback:** For UPI apps that do not pass data via `data.getStringExtra("response")`, parameters are safely extracted from Bundle extras and Intent data URI.

---

## 📄 License

MIT © [Tahir](https://github.com/tahir810)
