# react-native-upi 💳

> **A clean, complete, and zero-dependency React Native package for Android UPI payments using Native Intent (`startActivityForResult`).**
> 
> কোনো অতিরিক্ত থার্ড-পার্টি SDK বা এক্সটার্নাল ডিপেন্ডেন্সি ছাড়া সরাসরি Android-এর Native Java Module এবং `ActivityEventListener` ব্যবহার করে React Native অ্যাপে UPI পেমেন্ট ইমপ্লিমেন্ট করার সম্পূর্ণ ও আধুনিক সল্যুশন।

---

## 🌟 Features (সুবিধাসমূহ)

- ⚡ **100% Native Intent Implementation:** Uses native `startActivityForResult` with `ActivityEventListener` to listen for real-time payment results.
- 🛡️ **Zero External SDKs:** No third-party payment gateway SDK required—full control in your hands.
- 🎯 **All UPI Apps Supported:** Works with Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay, or opens the native Android UPI Chooser.
- 📦 **Automatic Response Parsing:** Automatically parses the raw UPI response string (`txnId`, `responseCode`, `ApprovalRefNo`, `Status`, `txnRef`) into a clean, strongly-typed JavaScript object.
- 📱 **UPI App Detection:** Query installed UPI apps on the user's device (`getInstalledUPIApps()`).
- 🔒 **Android 11+ Ready:** Includes pre-configured `<queries>` in `AndroidManifest.xml` for package visibility on Android 11, 12, 13, 14, and 15.
- 🔗 **React Native Autolinking:** Automatically links on React Native 0.60+ (no manual Java code editing required).
- 📘 **Full TypeScript Support:** Complete TypeScript declarations and type safety out of the box.

---

## 📥 Installation (ইনস্টলেশন)

```bash
# npm ব্যবহার করলে:
npm install react-native-upi

# yarn ব্যবহার করলে:
yarn add react-native-upi
```

---

## ⚙️ Android Configuration (কনফিগারেশন)

### 1. Autolinking (স্বয়ংক্রিয় লিংকিং)
React Native 0.60 বা তার পরবর্তী সংস্করণে প্যাকেজটি **স্বয়ংক্রিয়ভাবে লিঙ্ক হয়ে যায়**। কোনো অতিরিক্ত ফাইল এডিট করার প্রয়োজন নেই!

### 2. Manual Linking (প্রয়োজন হলে)
আপনার প্রজেক্ট যদি অনেক পুরোনো হয় অথবা ম্যানুয়াল লিংকিং দরকার হয়:

১. `android/settings.gradle` ফাইলে যুক্ত করুন:
```groovy
include ':react-native-upi'
project(':react-native-upi').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-upi/android')
```

২. `android/app/build.gradle` ফাইলে dependencies-এ যুক্ত করুন:
```groovy
dependencies {
    implementation project(':react-native-upi')
}
```

৩. `MainApplication.java` (বা `MainApplication.kt`)-এ যুক্ত করুন:
```java
import com.reactnativeupi.UPIPaymentPackage;

// getPackages() মেথডের ভেতরে:
packages.add(new UPIPaymentPackage());
```

---

## 🚀 Usage (ব্যবহার বিধি)

### ১. সহজ ব্যবহার (Direct 5 Arguments - User Prompt Match)
আপনার দেওয়া কোডের অনুরূপ সরাসরি ৫টি আর্গুমেন্ট দিয়ে কল করতে পারেন:

```typescript
import React from 'react';
import { View, Button, Alert, Platform } from 'react-native';
import { startPayment } from 'react-native-upi';

export default function PaymentScreen() {
  const makePayment = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('ত্রুটি', 'এই ফিচারটি শুধুমাত্র Android ডিভাইসের জন্য প্রযোজ্য।');
      return;
    }

    try {
      // 5-argument method (ডিফল্টভাবে Google Pay ওপেন করবে)
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

### ২. আধুনিক স্ট্রাকচার্ড মেথড (`initiatePayment`)
স্ট্রাকচার্ড অবজেক্ট পাস করে Google Pay, PhonePe, Paytm বা সিস্টেম Chooser ব্যবহার করুন এবং পার্স করা রেসপন্স অবজেক্ট পান:

```typescript
import { initiatePayment, isPaymentSuccessful, UPI_APPS } from 'react-native-upi';

const handlePayment = async () => {
  try {
    const result = await initiatePayment({
      vpa: 'merchant@upi',
      name: 'My Store',
      amount: '250.00',
      txnRef: 'TXN_' + Date.now(),
      note: 'Grocery Order',
      // নির্দিষ্ট অ্যাপ টার্গেট করতে পারেন অথবা CHOOSER ব্যবহার করতে পারেন:
      packageName: UPI_APPS.PHONEPE, // অথবা UPI_APPS.GOOGLE_PAY / UPI_APPS.PAYTM / UPI_APPS.CHOOSER
    });

    console.log('Status:', result.status);             // 'SUCCESS' | 'FAILURE' | 'SUBMITTED'
    console.log('Transaction ID:', result.txnId);      // e.g. 'UPI123456789'
    console.log('Approval Ref No:', result.approvalRefNo);
    console.log('Raw Response:', result.rawResponse);

    if (isPaymentSuccessful(result)) {
      alert(`পেমেন্ট সফল হয়েছে! ট্রানজ্যাকশন আইডি: ${result.txnId}`);
    } else {
      alert(`পেমেন্ট স্ট্যাটাস: ${result.status}`);
    }
  } catch (error: any) {
    alert(`পেমেন্ট বাতিল বা ব্যর্থ: ${error.message}`);
  }
};
```

---

### ৩. ইনস্টল থাকা UPI অ্যাপস চেক করা (`getInstalledUPIApps`)
ব্যবহারকারীর ফোনে কোন কোন UPI অ্যাপ ইনস্টল করা আছে তা চেক করে ডায়নামিক লিস্ট তৈরি করতে পারেন:

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getInstalledUPIApps, initiatePayment, InstalledUPIApp } from 'react-native-upi';

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
      <Text>পেমেন্টের জন্য অ্যাপ নির্বাচন করুন:</Text>
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

## 📖 API Reference (এপিআই রেফারেন্স)

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
import { UPI_APPS } from 'react-native-upi';

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
import { UPI_ERROR_CODES } from 'react-native-upi';

UPI_ERROR_CODES.PAYMENT_CANCELLED        // 'PAYMENT_CANCELLED'
UPI_ERROR_CODES.APP_NOT_INSTALLED        // 'APP_NOT_INSTALLED'
UPI_ERROR_CODES.ACTIVITY_DOES_NOT_EXIST  // 'ACTIVITY_DOES_NOT_EXIST'
UPI_ERROR_CODES.NOT_SUPPORTED_PLATFORM   // 'NOT_SUPPORTED_PLATFORM'
UPI_ERROR_CODES.INVALID_PARAMS           // 'INVALID_PARAMS'
```

---

## 🔍 How It Works Under The Hood (অভ্যন্তরীণ কার্যপদ্ধতি)

১. **Native Intent Creation:** React Native থেকে কল করার পর Java মডিউলে `upi://pay` স্কিমের মাধ্যমে একটি স্ট্যান্ডার্ড Android Intent তৈরি করা হয়।  
২. **Activity Request:** Android-এর `currentActivity.startActivityForResult(intent, 123)` কল করে টার্গেট UPI অ্যাপ (Google Pay, PhonePe ইত্যাদি) চালু করা হয়।  
৩. **Result Listener:** React Native-এর `ActivityEventListener` ইন্টারফেসের `onActivityResult` মেথড স্বয়ংক্রিয়ভাবে ব্যবহারকারীর পেমেন্টের রেজাল্ট ট্র্যাক করে।  
৪. **Promise Resolution:** ব্যবহারকারী পেমেন্ট শেষ করলে বা বাতিল করলে `Promise`-এর মাধ্যমে JavaScript-এ সরাসরি Raw String ডাটা চলে আসে।  
৫. **Automatic Fallback:** যেসকল UPI অ্যাপ `data.getStringExtra("response")`-এ ডাটা রিটার্ন করে না, সেগুলোর ক্ষেত্রে স্বয়ংক্রিয়ভাবে `Bundle extras` ও `dataString` থেকে তথ্য এক্সট্রাক্ট করা হয়।

---

## 📄 License

MIT © [Tahir](https://github.com/tahir)
