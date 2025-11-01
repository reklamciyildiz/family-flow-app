import { useState, useEffect, useCallback } from 'react';
import { BiometricAuth, CheckBiometryResult } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

interface StoredCredentials {
  email: string;
  password: string;
  timestamp: number;
}

const CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export const useBiometric = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState(false);
  const isMobile = Capacitor.isNativePlatform();

  // Biometric desteğini kontrol et
  useEffect(() => {
    if (!isMobile) {
      setIsAvailable(false);
      return;
    }

      const checkBiometry = async () => {
      try {
        const result: CheckBiometryResult = await BiometricAuth.checkBiometry();
        setIsAvailable(result.isAvailable);
        setBiometryType(String(result.biometryType || ''));
        
        // Kullanıcı biometric'i etkinleştirmiş mi?
        const enabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true';
        setIsEnabled(enabled);
      } catch (error) {
        console.error('Biometric kontrol hatası:', error);
        setIsAvailable(false);
      }
    };

    checkBiometry();
  }, [isMobile]);

  // Biometric ile giriş
  const authenticateWithBiometric = useCallback(async (): Promise<{ success: boolean; email?: string; password?: string }> => {
    if (!isMobile || !isAvailable || !isEnabled) {
      return { success: false };
    }

    try {
      // Kayıtlı kullanıcı bilgilerini al
      const storedData = localStorage.getItem(CREDENTIALS_KEY);
      if (!storedData) {
        return { success: false };
      }

      const credentials: StoredCredentials = JSON.parse(storedData);

      // Biometric doğrulama yap
      await BiometricAuth.authenticate({
        reason: 'BİRLİK uygulamasına giriş yapmak için',
        cancelTitle: 'İptal',
        allowDeviceCredential: true,
        iosFallbackTitle: 'Şifre kullan',
        androidTitle: 'Biyometrik Doğrulama',
        androidSubtitle: 'Parmak izinizi tarayın',
        androidConfirmationRequired: false,
      });

      // Biometric başarılı, email ve password döndür
      return { success: true, email: credentials.email, password: credentials.password };
    } catch (error: any) {
      console.error('Biometric authentication hatası:', error);
      
      // Kullanıcı iptal etti
      if (error.code === 10) {
        return { success: false };
      }
      
      return { success: false };
    }
  }, [isMobile, isAvailable, isEnabled]);

  // Biometric'i etkinleştir ve kullanıcı bilgilerini kaydet
  const enableBiometric = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!isMobile || !isAvailable) {
      return false;
    }

    try {
      // Önce biometric doğrulama yap
      await BiometricAuth.authenticate({
        reason: 'Biyometrik girişi etkinleştirmek için',
        cancelTitle: 'İptal',
        allowDeviceCredential: true,
        iosFallbackTitle: 'Şifre kullan',
        androidTitle: 'Biyometrik Doğrulama',
        androidSubtitle: 'Parmak izinizi tarayın',
        androidConfirmationRequired: false,
      });

      // Başarılı, kullanıcı bilgilerini kaydet (email + password)
      const credentials: StoredCredentials = {
        email,
        password,
        timestamp: Date.now(),
      };

      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
      localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      setIsEnabled(true);

      return true;
    } catch (error) {
      console.error('Biometric etkinleştirme hatası:', error);
      return false;
    }
  }, [isMobile, isAvailable]);

  // Biometric'i devre dışı bırak
  const disableBiometric = useCallback(() => {
    localStorage.removeItem(CREDENTIALS_KEY);
    localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    setIsEnabled(false);
  }, []);

  // Kayıtlı kullanıcı email'ini al
  const getSavedEmail = useCallback((): string | null => {
    const storedData = localStorage.getItem(CREDENTIALS_KEY);
    if (!storedData) return null;

    try {
      const credentials: StoredCredentials = JSON.parse(storedData);
      return credentials.email;
    } catch {
      return null;
    }
  }, []);

  return {
    isAvailable,
    biometryType,
    isEnabled,
    isMobile,
    authenticateWithBiometric,
    enableBiometric,
    disableBiometric,
    getSavedEmail,
  };
};

