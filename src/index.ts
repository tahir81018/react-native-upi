import { NativeModules, Platform } from 'react-native';
import {
  UPIPaymentConfig,
  UPIPaymentResponse,
  InstalledUPIApp,
  UPIAppPackage,
} from './types';
import { parseUPIResponse, isPaymentSuccessful } from './utils';
import { UPI_APPS, UPI_STATUS, UPI_ERROR_CODES } from './constants';

const LINKING_ERROR =
  `The package 'react-native-upi' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- UPI payment is only supported on Android.\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go (bare workflow or prebuild is required for native modules)\n';

interface NativeUPIModule {
  startPayment(
    vpa: string,
    name: string,
    amount: string,
    txnRef: string,
    note: string
  ): Promise<string>;
  startPaymentWithApp(
    vpa: string,
    name: string,
    amount: string,
    txnRef: string,
    note: string,
    packageName: string
  ): Promise<string>;
  initiatePayment(options: Record<string, any>): Promise<string>;
  getInstalledUPIApps(): Promise<InstalledUPIApp[]>;
  isAppInstalled(packageName: string): Promise<boolean>;
}

export const CustomUPIPayment: NativeUPIModule =
  NativeModules.CustomUPIPayment
    ? NativeModules.CustomUPIPayment
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      ) as NativeUPIModule;

/**
 * Checks if the current platform is Android.
 */
function assertAndroidPlatform(): void {
  if (Platform.OS !== 'android') {
    throw new Error(
      `${UPI_ERROR_CODES.NOT_SUPPORTED_PLATFORM}: UPI payment via native intent is only supported on Android.`
    );
  }
}

/**
 * Initiates a UPI payment using a structured configuration object.
 * Returns a parsed, structured UPIPaymentResponse.
 *
 * @example
 * ```ts
 * const result = await initiatePayment({
 *   vpa: 'merchant@upi',
 *   name: 'Merchant Store',
 *   amount: '1.00',
 *   txnRef: 'TXN_' + Date.now(),
 *   note: 'Payment for order',
 *   packageName: UPI_APPS.GOOGLE_PAY // or omit for chooser
 * });
 * console.log(result.status, result.txnId);
 * ```
 */
export async function initiatePayment(
  config: UPIPaymentConfig
): Promise<UPIPaymentResponse> {
  assertAndroidPlatform();

  if (!config.vpa || !config.name || !config.amount || !config.txnRef) {
    throw new Error(
      `${UPI_ERROR_CODES.INVALID_PARAMS}: 'vpa', 'name', 'amount', and 'txnRef' are required fields.`
    );
  }

  const raw = await CustomUPIPayment.initiatePayment({
    vpa: config.vpa,
    name: config.name,
    amount: config.amount,
    txnRef: config.txnRef,
    note: config.note || '',
    currency: config.currency || 'INR',
    merchantCode: config.merchantCode,
    url: config.url,
    packageName: config.packageName,
  });

  return parseUPIResponse(raw);
}

/**
 * Starts a UPI payment.
 *
 * Supports both signatures:
 * 1. 5/6 arguments matching standard native method (returns raw string):
 *    startPayment(vpa, name, amount, txnRef, note, packageName?)
 *
 * 2. Single configuration object (returns parsed UPIPaymentResponse):
 *    startPayment({ vpa, name, amount, txnRef, note, packageName })
 */
export async function startPayment(
  config: UPIPaymentConfig
): Promise<UPIPaymentResponse>;
export async function startPayment(
  vpa: string,
  name: string,
  amount: string,
  txnRef: string,
  note: string,
  packageName?: string
): Promise<string>;
export async function startPayment(
  vpaOrConfig: string | UPIPaymentConfig,
  name?: string,
  amount?: string,
  txnRef?: string,
  note?: string,
  packageName?: string
): Promise<string | UPIPaymentResponse> {
  assertAndroidPlatform();

  if (typeof vpaOrConfig === 'object') {
    return initiatePayment(vpaOrConfig);
  }

  if (packageName) {
    return CustomUPIPayment.startPaymentWithApp(
      vpaOrConfig,
      name || '',
      amount || '',
      txnRef || '',
      note || '',
      packageName
    );
  }

  return CustomUPIPayment.startPayment(
    vpaOrConfig,
    name || '',
    amount || '',
    txnRef || '',
    note || ''
  );
}

/**
 * Starts payment with Google Pay directly and returns raw response string.
 */
export async function startGooglePay(
  vpa: string,
  name: string,
  amount: string,
  txnRef: string,
  note: string
): Promise<string> {
  assertAndroidPlatform();
  return CustomUPIPayment.startPayment(vpa, name, amount, txnRef, note);
}

/**
 * Retrieves a list of all installed UPI apps capable of handling 'upi://pay' on the device.
 */
export async function getInstalledUPIApps(): Promise<InstalledUPIApp[]> {
  assertAndroidPlatform();
  return CustomUPIPayment.getInstalledUPIApps();
}

/**
 * Checks if a specific app is installed on the device by its Android package name.
 *
 * @param packageName Android package name (e.g. UPI_APPS.GOOGLE_PAY)
 */
export async function isAppInstalled(
  packageName: UPIAppPackage | string
): Promise<boolean> {
  assertAndroidPlatform();
  return CustomUPIPayment.isAppInstalled(packageName);
}

export { parseUPIResponse, isPaymentSuccessful };
export { UPI_APPS, UPI_STATUS, UPI_ERROR_CODES };
export * from './types';

export default {
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
};
