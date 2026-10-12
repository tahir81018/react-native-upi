export const Platform = {
  OS: 'android',
  select: (obj: any) => obj.android ?? obj.default,
};

export const NativeModules = {
  CustomUPIPayment: {
    startPayment: jest.fn(),
    startPaymentWithApp: jest.fn(),
    initiatePayment: jest.fn(),
    getInstalledUPIApps: jest.fn(),
    isAppInstalled: jest.fn(),
  },
};
