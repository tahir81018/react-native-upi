export const UPI_APPS = {
  GOOGLE_PAY: 'com.google.android.apps.nbu.paisa.user',
  PHONEPE: 'com.phonepe.app',
  PAYTM: 'net.one97.paytm',
  BHIM: 'in.org.npci.upiapp',
  CRED: 'com.dreamplug.androidapp',
  AMAZON_PAY: 'in.amazon.mShop.android.shopping',
  MOBIKWIK: 'com.mobikwik_new',
  SAMSUNG_PAY: 'com.samsung.android.spay',
  WHATSAPP: 'com.whatsapp',
  CHOOSER: 'CHOOSER',
} as const;

export const UPI_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  SUBMITTED: 'SUBMITTED',
} as const;

export const UPI_ERROR_CODES = {
  ACTIVITY_DOES_NOT_EXIST: 'ACTIVITY_DOES_NOT_EXIST',
  PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
  APP_NOT_INSTALLED: 'APP_NOT_INSTALLED',
  INTENT_ERROR: 'INTENT_ERROR',
  INVALID_PARAMS: 'INVALID_PARAMS',
  NOT_SUPPORTED_PLATFORM: 'NOT_SUPPORTED_PLATFORM',
  MODULE_NOT_FOUND: 'MODULE_NOT_FOUND',
} as const;
