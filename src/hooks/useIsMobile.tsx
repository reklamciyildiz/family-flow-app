import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Check if running on native platform
    const platform = Capacitor.getPlatform();
    const native = platform === 'android' || platform === 'ios';
    setIsNative(native);

    // Check screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile, isNative, platform: Capacitor.getPlatform() };
};

