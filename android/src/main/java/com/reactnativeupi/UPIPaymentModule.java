package com.reactnativeupi;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class UPIPaymentModule extends ReactContextBaseJavaModule {

    public static final String MODULE_NAME = "CustomUPIPayment";
    private static final int UPI_PAYMENT_REQUEST_CODE = 123;
    public static final String GOOGLE_PAY_PACKAGE_NAME = "com.google.android.apps.nbu.paisa.user";

    private Promise mPaymentPromise;

    // ActivityEventListener to listen for startActivityForResult responses
    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == UPI_PAYMENT_REQUEST_CODE) {
                if (mPaymentPromise != null) {
                    if (data != null) {
                        // Extract response string (Standard Google Pay / UPI Intent response format)
                        String responseData = data.getStringExtra("response");

                        // Fallback for UPI apps that return parameters inside Bundle extras
                        if (responseData == null || responseData.trim().isEmpty()) {
                            Bundle extras = data.getExtras();
                            if (extras != null && !extras.isEmpty()) {
                                StringBuilder sb = new StringBuilder();
                                for (String key : extras.keySet()) {
                                    Object val = extras.get(key);
                                    if (val != null) {
                                        if (sb.length() > 0) sb.append("&");
                                        sb.append(key).append("=").append(val.toString());
                                    }
                                }
                                if (sb.length() > 0) {
                                    responseData = sb.toString();
                                }
                            }
                        }

                        // Fallback for UPI apps returning data in intent URI
                        if (responseData == null || responseData.trim().isEmpty()) {
                            String dataString = data.getDataString();
                            if (dataString != null) {
                                int qIdx = dataString.indexOf('?');
                                responseData = (qIdx != -1) ? dataString.substring(qIdx + 1) : dataString;
                            }
                        }

                        if (responseData != null && !responseData.trim().isEmpty()) {
                            mPaymentPromise.resolve(responseData);
                        } else {
                            mPaymentPromise.reject("PAYMENT_CANCELLED", "User cancelled or no data received");
                        }
                    } else {
                        mPaymentPromise.reject("PAYMENT_CANCELLED", "User cancelled or no data received");
                    }
                    mPaymentPromise = null;
                }
            }
        }
    };

    public UPIPaymentModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(mActivityEventListener);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        try {
            getReactApplicationContext().removeActivityEventListener(mActivityEventListener);
        } catch (Exception ignored) {
        }
    }

    /**
     * Start payment with standard 5 parameters (defaults to Google Pay)
     */
    @ReactMethod
    public void startPayment(String vpa, String name, String amount, String txnRef, String note, Promise promise) {
        startPaymentInternal(vpa, name, amount, "INR", txnRef, note, null, null, null, null, GOOGLE_PAY_PACKAGE_NAME, promise);
    }

    /**
     * Start payment with a specific package name or chooser
     */
    @ReactMethod
    public void startPaymentWithApp(String vpa, String name, String amount, String txnRef, String note, String packageName, Promise promise) {
        startPaymentInternal(vpa, name, amount, "INR", txnRef, note, null, null, null, null, packageName, promise);
    }

    /**
     * Start payment with full options map
     */
    @ReactMethod
    public void initiatePayment(ReadableMap options, Promise promise) {
        String vpa = options.hasKey("vpa") ? options.getString("vpa") : null;
        String name = options.hasKey("name") ? options.getString("name") : null;
        String amount = options.hasKey("amount") ? options.getString("amount") : null;
        String currency = options.hasKey("currency") ? options.getString("currency") : "INR";
        String txnRef = options.hasKey("txnRef") ? options.getString("txnRef") : null;
        String note = options.hasKey("note") ? options.getString("note") : "";
        String merchantCode = options.hasKey("merchantCode") ? options.getString("merchantCode") : null;
        String url = options.hasKey("url") ? options.getString("url") : null;
        String mode = options.hasKey("mode") ? options.getString("mode") : null;
        String orgid = options.hasKey("orgid") ? options.getString("orgid") : null;
        String packageName = options.hasKey("packageName") ? options.getString("packageName") : null;

        if (vpa == null || vpa.trim().isEmpty()) {
            promise.reject("INVALID_PARAMS", "VPA (pa) cannot be empty");
            return;
        }

        if (name == null || name.trim().isEmpty()) {
            promise.reject("INVALID_PARAMS", "Name (pn) cannot be empty");
            return;
        }

        if (amount == null || amount.trim().isEmpty()) {
            promise.reject("INVALID_PARAMS", "Amount (am) cannot be empty");
            return;
        }

        if (txnRef == null || txnRef.trim().isEmpty()) {
            promise.reject("INVALID_PARAMS", "Transaction Reference (tr) cannot be empty");
            return;
        }

        startPaymentInternal(vpa, name, amount, currency, txnRef, note, merchantCode, url, mode, orgid, packageName, promise);
    }

    private void startPaymentInternal(
            String vpa,
            String name,
            String amount,
            String currency,
            String txnRef,
            String note,
            String merchantCode,
            String url,
            String mode,
            String orgid,
            String packageName,
            Promise promise
    ) {
        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            promise.reject("ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist");
            return;
        }

        if (mPaymentPromise != null) {
            // Cancel previous orphaned promise if user triggers a new payment
            mPaymentPromise.reject("PAYMENT_CANCELLED", "New payment initiated before previous completed");
            mPaymentPromise = null;
        }

        mPaymentPromise = promise;

        try {
            Uri.Builder uriBuilder = new Uri.Builder()
                    .scheme("upi")
                    .authority("pay")
                    .appendQueryParameter("pa", vpa)
                    .appendQueryParameter("pn", name)
                    .appendQueryParameter("am", amount)
                    .appendQueryParameter("cu", currency != null && !currency.isEmpty() ? currency : "INR")
                    .appendQueryParameter("tr", txnRef);

            if (note != null && !note.isEmpty()) {
                uriBuilder.appendQueryParameter("tn", note);
            }

            if (merchantCode != null && !merchantCode.isEmpty()) {
                uriBuilder.appendQueryParameter("mc", merchantCode);
            }

            if (url != null && !url.isEmpty()) {
                uriBuilder.appendQueryParameter("url", url);
            }

            if (mode != null && !mode.isEmpty()) {
                uriBuilder.appendQueryParameter("mode", mode);
            }

            if (orgid != null && !orgid.isEmpty()) {
                uriBuilder.appendQueryParameter("orgid", orgid);
            }

            Uri uri = uriBuilder.build();
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(uri);

            if (packageName != null && !packageName.trim().isEmpty() && !packageName.equalsIgnoreCase("CHOOSER")) {
                intent.setPackage(packageName);
                currentActivity.startActivityForResult(intent, UPI_PAYMENT_REQUEST_CODE);
            } else {
                Intent chooser = Intent.createChooser(intent, "Pay with UPI");
                currentActivity.startActivityForResult(chooser, UPI_PAYMENT_REQUEST_CODE);
            }
        } catch (ActivityNotFoundException e) {
            if (mPaymentPromise != null) {
                mPaymentPromise.reject("APP_NOT_INSTALLED", "Target UPI application is not installed on this device: " + e.getMessage());
                mPaymentPromise = null;
            }
        } catch (Exception e) {
            if (mPaymentPromise != null) {
                mPaymentPromise.reject("INTENT_ERROR", e.getMessage());
                mPaymentPromise = null;
            }
        }
    }

    /**
     * Get list of all installed UPI apps on the device (deduplicated by package)
     */
    @ReactMethod
    public void getInstalledUPIApps(Promise promise) {
        try {
            PackageManager pm = getReactApplicationContext().getPackageManager();
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse("upi://pay"));

            List<ResolveInfo> resolveInfoList = pm.queryIntentActivities(intent, 0);

            WritableArray appList = Arguments.createArray();
            Set<String> seenPackages = new HashSet<>();

            for (ResolveInfo info : resolveInfoList) {
                if (info.activityInfo != null && info.activityInfo.packageName != null) {
                    String pkg = info.activityInfo.packageName;
                    if (seenPackages.add(pkg)) {
                        WritableMap app = Arguments.createMap();
                        app.putString("packageName", pkg);
                        app.putString("name", info.loadLabel(pm).toString());
                        appList.pushMap(app);
                    }
                }
            }
            promise.resolve(appList);
        } catch (Exception e) {
            promise.reject("GET_APPS_ERROR", "Failed to query installed UPI apps: " + e.getMessage());
        }
    }

    /**
     * Check if a specific UPI app is installed by package name
     */
    @ReactMethod
    public void isAppInstalled(String packageName, Promise promise) {
        if (packageName == null || packageName.trim().isEmpty()) {
            promise.resolve(false);
            return;
        }

        try {
            PackageManager pm = getReactApplicationContext().getPackageManager();
            pm.getPackageInfo(packageName, PackageManager.GET_ACTIVITIES);
            promise.resolve(true);
        } catch (PackageManager.NameNotFoundException e) {
            promise.resolve(false);
        } catch (Exception e) {
            promise.reject("CHECK_APP_ERROR", "Failed to check if app is installed: " + e.getMessage());
        }
    }
}
