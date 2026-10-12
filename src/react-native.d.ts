declare module 'react-native' {
  export interface PlatformSelectSpec<T> {
    android?: T;
    ios?: T;
    default?: T;
    [key: string]: T | undefined;
  }

  export const Platform: {
    OS: 'android' | 'ios' | 'windows' | 'macos' | 'web';
    select: <T>(specifics: PlatformSelectSpec<T>) => T | undefined;
  };

  export const NativeModules: {
    CustomUPIPayment?: any;
    [key: string]: any;
  };
}
