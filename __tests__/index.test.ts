import UPIPayment, {
  startPayment,
  initiatePayment,
  startGooglePay,
  getInstalledUPIApps,
  isAppInstalled,
  parseUPIResponse,
  isPaymentSuccessful,
  UPI_APPS,
  UPI_STATUS,
  UPI_ERROR_CODES,
  CustomUPIPayment,
} from '../src/index';
import { Platform } from 'react-native';

describe('@tahir810/react-native-upi index module', () => {
  beforeEach(() => {
    (Platform as any).OS = 'android';
    jest.clearAllMocks();
  });

  it('exports all expected functions, constants, and objects', () => {
    expect(UPIPayment).toBeDefined();
    expect(typeof startPayment).toBe('function');
    expect(typeof initiatePayment).toBe('function');
    expect(typeof startGooglePay).toBe('function');
    expect(typeof getInstalledUPIApps).toBe('function');
    expect(typeof isAppInstalled).toBe('function');
    expect(typeof parseUPIResponse).toBe('function');
    expect(typeof isPaymentSuccessful).toBe('function');
    expect(UPI_APPS).toBeDefined();
    expect(UPI_STATUS).toBeDefined();
    expect(UPI_ERROR_CODES).toBeDefined();
    expect(CustomUPIPayment).toBeDefined();
  });

  it('contains expected UPI_APPS package IDs', () => {
    expect(UPI_APPS.GOOGLE_PAY).toBe('com.google.android.apps.nbu.paisa.user');
    expect(UPI_APPS.PHONEPE).toBe('com.phonepe.app');
    expect(UPI_APPS.PAYTM).toBe('net.one97.paytm');
    expect(UPI_APPS.BHIM).toBe('in.org.npci.upiapp');
    expect(UPI_APPS.CHOOSER).toBe('CHOOSER');
  });

  it('invokes native startPayment method with 5 args (matching prompt example)', async () => {
    (CustomUPIPayment.startPayment as jest.Mock).mockResolvedValue(
      'Status=SUCCESS&txnId=UPI123'
    );

    const response = await startPayment(
      'merchant@upi',
      'Merchant Name',
      '1.00',
      'TXN123',
      'Order Payment'
    );

    expect(CustomUPIPayment.startPayment).toHaveBeenCalledWith(
      'merchant@upi',
      'Merchant Name',
      '1.00',
      'TXN123',
      'Order Payment'
    );
    expect(response).toBe('Status=SUCCESS&txnId=UPI123');
  });

  it('invokes native initiatePayment method with structured config', async () => {
    (CustomUPIPayment.initiatePayment as jest.Mock).mockResolvedValue(
      'Status=SUCCESS&txnId=UPI999&responseCode=0&ApprovalRefNo=APR1&txnRef=TXN77'
    );

    const response = await initiatePayment({
      vpa: 'merchant@upi',
      name: 'Merchant Store',
      amount: '50.00',
      txnRef: 'TXN77',
      note: 'Grocery item',
      packageName: UPI_APPS.GOOGLE_PAY,
    });

    expect(CustomUPIPayment.initiatePayment).toHaveBeenCalledWith({
      vpa: 'merchant@upi',
      name: 'Merchant Store',
      amount: '50.00',
      txnRef: 'TXN77',
      note: 'Grocery item',
      currency: 'INR',
      merchantCode: undefined,
      url: undefined,
      packageName: 'com.google.android.apps.nbu.paisa.user',
    });
    expect(response.status).toBe('SUCCESS');
    expect(response.txnId).toBe('UPI999');
    expect(response.approvalRefNo).toBe('APR1');
  });

  it('calls getInstalledUPIApps and isAppInstalled', async () => {
    (CustomUPIPayment.getInstalledUPIApps as jest.Mock).mockResolvedValue([
      { name: 'Google Pay', packageName: UPI_APPS.GOOGLE_PAY },
      { name: 'PhonePe', packageName: UPI_APPS.PHONEPE },
    ]);
    (CustomUPIPayment.isAppInstalled as jest.Mock).mockResolvedValue(true);

    const apps = await getInstalledUPIApps();
    expect(apps).toHaveLength(2);
    expect(apps[0].name).toBe('Google Pay');

    const installed = await isAppInstalled(UPI_APPS.GOOGLE_PAY);
    expect(installed).toBe(true);
  });

  it('rejects on non-Android platforms', async () => {
    (Platform as any).OS = 'ios';

    await expect(
      initiatePayment({
        vpa: 'test@upi',
        name: 'Test',
        amount: '1.00',
        txnRef: 'TXN1',
      })
    ).rejects.toThrow('NOT_SUPPORTED_PLATFORM');
  });

  it('rejects when required parameters are missing in initiatePayment', async () => {
    await expect(
      initiatePayment({
        vpa: '',
        name: 'Test',
        amount: '1.00',
        txnRef: 'TXN1',
      })
    ).rejects.toThrow('INVALID_PARAMS');
  });
});
