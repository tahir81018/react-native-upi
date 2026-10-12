import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {
  initiatePayment,
  isPaymentSuccessful,
  UPI_APPS,
  UPIPaymentResponse,
} from '@tahir810/react-native-upi';

export default function App() {
  const [vpa, setVpa] = useState('merchant@okhdfcbank');
  const [amount, setAmount] = useState('1.00');
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<UPIPaymentResponse | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  /**
   * Primary Test Pay Button Handler
   * Triggers the native Android UPI Intent (startActivityForResult)
   */
  const handleTestPay = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Notice', 'UPI intent payments are only supported on Android devices.');
      return;
    }

    setLoading(true);
    setPaymentResult(null);

    try {
      const txnRef = 'TXN' + Date.now();

      // Launch UPI payment via native intent using system chooser (or GPay/PhonePe)
      const result = await initiatePayment({
        vpa: vpa.trim(),
        name: 'Test Merchant Store',
        amount: amount.trim(),
        txnRef: txnRef,
        note: 'Test Order Payment',
        packageName: UPI_APPS.CHOOSER, // Opens chooser dialog with all installed UPI apps
      });

      setPaymentResult(result);

      if (isPaymentSuccessful(result)) {
        Alert.alert(
          'Payment Successful! 🎉',
          `Transaction ID: ${result.txnId || 'N/A'}\nApproval Code: ${result.approvalRefNo || 'N/A'}`
        );
      } else {
        Alert.alert('Payment Status', `Status: ${result.status}\nRef: ${result.txnRef || 'N/A'}`);
      }
    } catch (error: any) {
      console.error('Payment Error:', error);
      Alert.alert('Payment Cancelled / Error', error.message || 'Payment was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>UPI Intent Test</Text>
          <Text style={styles.title}>Payment Test</Text>
          <Text style={styles.subtitle}>Native Android startActivityForResult</Text>
        </View>

        {/* Payment Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TOTAL PAYABLE</Text>
          <Text style={styles.amountText}>₹{amount}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payee VPA:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {vpa}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payee Name:</Text>
            <Text style={styles.infoValue}>Test Merchant Store</Text>
          </View>
        </View>

        {/* 🔘 Single Prominent Test Pay Button */}
        <TouchableOpacity
          style={[styles.payButton, loading && styles.disabledButton]}
          onPress={handleTestPay}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.payButtonText}>💳 Pay ₹{amount} with UPI</Text>
          )}
        </TouchableOpacity>

        {/* Payment Result Status Banner */}
        {paymentResult && (
          <View
            style={[
              styles.resultCard,
              paymentResult.status === 'SUCCESS' ? styles.successBorder : styles.failureBorder,
            ]}
          >
            <Text
              style={[
                styles.resultStatus,
                paymentResult.status === 'SUCCESS' ? styles.successColor : styles.failureColor,
              ]}
            >
              {paymentResult.status === 'SUCCESS' ? '✓ PAYMENT SUCCESS' : '✕ PAYMENT FAILED'}
            </Text>
            {paymentResult.txnId ? (
              <Text style={styles.resultText}>Txn ID: {paymentResult.txnId}</Text>
            ) : null}
            {paymentResult.approvalRefNo ? (
              <Text style={styles.resultText}>Approval Ref: {paymentResult.approvalRefNo}</Text>
            ) : null}
            <Text style={styles.rawText}>Raw: {paymentResult.rawResponse}</Text>
          </View>
        )}

        {/* Optional Toggle to Edit Test UPI ID */}
        <TouchableOpacity
          style={styles.toggleSettings}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Text style={styles.toggleText}>
            {showSettings ? '▲ Hide VPA Configuration' : '▼ Edit Test VPA / Amount'}
          </Text>
        </TouchableOpacity>

        {showSettings && (
          <View style={styles.settingsCard}>
            <Text style={styles.inputLabel}>Merchant UPI ID (VPA):</Text>
            <TextInput
              style={styles.input}
              value={vpa}
              onChangeText={setVpa}
              placeholder="e.g. your-vpa@okhdfcbank"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Amount (INR):</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="1.00"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#E8F0FE',
    color: '#1A73E8',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#202124',
  },
  subtitle: {
    fontSize: 13,
    color: '#5f6368',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#80868B',
    letterSpacing: 1,
  },
  amountText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1A73E8',
    marginVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EAED',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#5F6368',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#202124',
    maxWidth: '65%',
  },
  payButton: {
    backgroundColor: '#1A73E8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#1A73E8',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  disabledButton: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 5,
  },
  successBorder: {
    borderLeftColor: '#0F9D58',
  },
  failureBorder: {
    borderLeftColor: '#D93025',
  },
  resultStatus: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  successColor: {
    color: '#0F9D58',
  },
  failureColor: {
    color: '#D93025',
  },
  resultText: {
    fontSize: 13,
    color: '#3C4043',
    marginVertical: 2,
  },
  rawText: {
    fontSize: 11,
    color: '#80868B',
    marginTop: 6,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  toggleSettings: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 13,
    color: '#1A73E8',
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3C4043',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 10,
    color: '#202124',
  },
});
