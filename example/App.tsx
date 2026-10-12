import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import UPIPayment, {
  startPayment,
  initiatePayment,
  getInstalledUPIApps,
  isPaymentSuccessful,
  UPI_APPS,
  InstalledUPIApp,
  UPIPaymentResponse,
} from 'react-native-upi';

export default function App() {
  const [vpa, setVpa] = useState('merchant@okhdfcbank');
  const [name, setName] = useState('Super Store');
  const [amount, setAmount] = useState('1.00');
  const [note, setNote] = useState('Payment for Order #101');
  const [installedApps, setInstalledApps] = useState<InstalledUPIApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<UPIPaymentResponse | null>(null);

  useEffect(() => {
    loadInstalledApps();
  }, []);

  const loadInstalledApps = async () => {
    if (Platform.OS !== 'android') return;
    try {
      const apps = await getInstalledUPIApps();
      setInstalledApps(apps);
    } catch (e: any) {
      console.warn('Failed to get installed UPI apps:', e.message);
    }
  };

  /**
   * Example 1: Direct 5-argument method matching prompt specification
   * Returns the raw response string from Google Pay
   */
  const handleDirectGooglePay = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Notice', 'UPI Payment is only available on Android');
      return;
    }

    setLoading(true);
    try {
      const txnRef = 'TXN' + Date.now();
      const rawResponse = await startPayment(vpa, name, amount, txnRef, note);
      console.log('Google Pay Response:', rawResponse);
      Alert.alert('Payment Response', rawResponse);
    } catch (error: any) {
      console.error('Payment Error:', error);
      Alert.alert('Payment Error', error.message || 'Payment cancelled or failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Example 2: Structured payment with Chooser or specific app
   * Returns parsed object with status, txnId, approvalRefNo, etc.
   */
  const handlePaymentWithOptions = async (packageName?: string) => {
    if (Platform.OS !== 'android') {
      Alert.alert('Notice', 'UPI Payment is only available on Android');
      return;
    }

    setLoading(true);
    try {
      const txnRef = 'TXN' + Date.now();
      const result = await initiatePayment({
        vpa,
        name,
        amount,
        txnRef,
        note,
        packageName: packageName || UPI_APPS.CHOOSER,
      });

      setLastResponse(result);

      if (isPaymentSuccessful(result)) {
        Alert.alert(
          'Payment Successful! 🎉',
          `Transaction ID: ${result.txnId}\nApproval Ref: ${result.approvalRefNo || 'N/A'}`
        );
      } else {
        Alert.alert('Payment Status', `Status: ${result.status}\nRaw: ${result.rawResponse}`);
      }
    } catch (error: any) {
      Alert.alert('Payment Cancelled / Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>React Native UPI Payment</Text>
        <Text style={styles.subtitle}>Native Intent Payment (startActivityForResult)</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Details</Text>

          <Text style={styles.label}>Merchant UPI ID (VPA):</Text>
          <TextInput
            style={styles.input}
            value={vpa}
            onChangeText={setVpa}
            placeholder="e.g. merchant@upi"
          />

          <Text style={styles.label}>Payee Name:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Super Store"
          />

          <Text style={styles.label}>Amount (INR):</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="1.00"
          />

          <Text style={styles.label}>Note / Description:</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Payment note"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4285F4" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.buttonContainer}>
            {/* Primary Google Pay direct trigger */}
            <TouchableOpacity
              style={[styles.button, styles.googlePayBtn]}
              onPress={handleDirectGooglePay}
            >
              <Text style={styles.buttonText}>Pay with Google Pay (Direct)</Text>
            </TouchableOpacity>

            {/* UPI System Chooser (All installed UPI apps) */}
            <TouchableOpacity
              style={[styles.button, styles.chooserBtn]}
              onPress={() => handlePaymentWithOptions(UPI_APPS.CHOOSER)}
            >
              <Text style={styles.buttonText}>Open UPI App Chooser</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Installed UPI Apps list */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Installed UPI Apps ({installedApps.length})</Text>
          {installedApps.length === 0 ? (
            <Text style={styles.emptyText}>No UPI apps detected or running on emulator</Text>
          ) : (
            installedApps.map((app) => (
              <TouchableOpacity
                key={app.packageName}
                style={styles.appRow}
                onPress={() => handlePaymentWithOptions(app.packageName)}
              >
                <Text style={styles.appName}>{app.name}</Text>
                <Text style={styles.payBadge}>Pay →</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Response preview */}
        {lastResponse && (
          <View style={styles.responseCard}>
            <Text style={styles.cardTitle}>Last Response</Text>
            <Text style={styles.responseStatus}>
              Status:{' '}
              <Text
                style={{
                  color: lastResponse.status === 'SUCCESS' ? '#2e7d32' : '#c62828',
                }}
              >
                {lastResponse.status}
              </Text>
            </Text>
            {lastResponse.txnId && <Text>Txn ID: {lastResponse.txnId}</Text>}
            {lastResponse.approvalRefNo && (
              <Text>Approval Ref: {lastResponse.approvalRefNo}</Text>
            )}
            <Text style={styles.rawText}>Raw: {lastResponse.rawResponse}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1D20',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#212529',
    marginBottom: 12,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  googlePayBtn: {
    backgroundColor: '#0F9D58',
  },
  chooserBtn: {
    backgroundColor: '#4285F4',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    color: '#868e96',
    fontStyle: 'italic',
  },
  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#343a40',
  },
  payBadge: {
    fontSize: 13,
    color: '#0F9D58',
    fontWeight: '700',
  },
  responseCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
  },
  responseStatus: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rawText: {
    fontSize: 11,
    color: '#6c757d',
    marginTop: 8,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
});
