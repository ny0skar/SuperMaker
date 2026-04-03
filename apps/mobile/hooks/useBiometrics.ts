import { useEffect, useState, useCallback } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BIOMETRIC_TOKEN_KEY = "biometric_refresh_token";
const BIOMETRIC_ENABLED_KEY = "biometric_enabled";

export type BiometricType = "faceid" | "fingerprint" | "iris" | "none";

export function useBiometrics() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>("none");

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsAvailable(compatible && enrolled);

    if (compatible && enrolled) {
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        )
      ) {
        setBiometricType("faceid");
      } else if (
        types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
      ) {
        setBiometricType("fingerprint");
      } else if (
        types.includes(LocalAuthentication.AuthenticationType.IRIS)
      ) {
        setBiometricType("iris");
      }
    }

    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    setIsEnabled(enabled === "true");
  };

  const getBiometricLabel = useCallback((): string => {
    if (biometricType === "faceid") {
      return Platform.OS === "ios" ? "Face ID" : "Face Unlock";
    }
    if (biometricType === "fingerprint") {
      return Platform.OS === "ios" ? "Touch ID" : "Huella dactilar";
    }
    if (biometricType === "iris") return "Iris";
    return "Biometría";
  }, [biometricType]);

  const getBiometricIcon = useCallback((): string => {
    if (biometricType === "faceid") return "scan-outline";
    if (biometricType === "fingerprint") return "finger-print-outline";
    return "shield-checkmark-outline";
  }, [biometricType]);

  /** Save refresh token protected by biometrics */
  const enableBiometrics = async (refreshToken: string): Promise<boolean> => {
    try {
      // First try storing without biometric protection (works in Expo Go)
      // In production builds, requireAuthentication will work properly
      const options = __DEV__
        ? {}
        : {
            requireAuthentication: true,
            authenticationPrompt: "Confirma tu identidad para activar acceso biométrico",
          };
      await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, refreshToken, options);
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
      setIsEnabled(true);
      return true;
    } catch {
      // Clean up any partial state
      await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY).catch(() => {});
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY).catch(() => {});
      setIsEnabled(false);
      return false;
    }
  };

  /** Disable biometrics and remove stored token */
  const disableBiometrics = async () => {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      setIsEnabled(false);
    } catch {
      // ignore
    }
  };

  /** Authenticate with biometrics and return the stored refresh token */
  const authenticateWithBiometrics =
    async (): Promise<string | null> => {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Accede a SuperMaker",
          cancelLabel: "Cancelar",
          disableDeviceFallback: false,
        });

        if (!result.success) return null;

        const options = __DEV__
          ? {}
          : {
              requireAuthentication: true,
              authenticationPrompt: "Confirma tu identidad",
            };
        const token = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY, options);

        return token;
      } catch {
        return null;
      }
    };

  /** Check if there's a biometric token stored */
  const hasBiometricToken = async (): Promise<boolean> => {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === "true";
  };

  return {
    isAvailable,
    isEnabled,
    biometricType,
    getBiometricLabel,
    getBiometricIcon,
    enableBiometrics,
    disableBiometrics,
    authenticateWithBiometrics,
    hasBiometricToken,
  };
}
