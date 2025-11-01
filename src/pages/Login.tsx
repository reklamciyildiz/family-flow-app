import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, Fingerprint } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBiometric } from '@/hooks/useBiometric';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showBiometricDialog, setShowBiometricDialog] = useState(false);
  const navigate = useNavigate();
  
  const { 
    isAvailable, 
    biometryType, 
    isEnabled, 
    isMobile,
    authenticateWithBiometric,
    enableBiometric,
    getSavedEmail,
  } = useBiometric();

  // Otomatik session kontrolü - Sadece normal durumda (logout yapılmamışsa)
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Session varsa dashboard'a yönlendir
          // AMA: Eğer kullanıcı MANUEL olarak login sayfasına geldiyse (logout sonrası gibi),
          // biometric butonu gösterilmesi için session kontrolünü yapmayalım
          // Index sayfasından geldiyse zaten Index sayfası session kontrolü yapacak
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Session kontrolü hatası:', error);
      } finally {
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [navigate]);

  // Sayfa yüklendiğinde saved email'i set et
  useEffect(() => {
    if (isAvailable && isEnabled) {
      const savedEmail = getSavedEmail();
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, [isAvailable, isEnabled, getSavedEmail]);

  // Biometric ile giriş
  const handleBiometricLogin = async () => {
    setLoading(true);
    
    try {
      const result = await authenticateWithBiometric();
      
      if (!result.success || !result.email) {
        toast.error('Biyometrik doğrulama başarısız');
        setLoading(false);
        return;
      }

      // Email'i al ve session'ı kontrol et
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        toast.success('Hoş geldiniz! 👋');
        navigate('/dashboard');
      } else {
        toast.error('Lütfen tekrar giriş yapın');
      }
    } catch (error: any) {
      console.error('Biometric login hatası:', error);
      toast.error('Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Hoş geldiniz! 👋');
      
      // Biometric etkin değilse ve mobilde ise dialog göster
      if (isMobile && isAvailable && !isEnabled) {
        setShowBiometricDialog(true);
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  // Biometric kayıt dialog'unda "Evet" dediğinde
  const handleEnableBiometric = async () => {
    setShowBiometricDialog(false);
    const success = await enableBiometric(email);
    
    if (success) {
      toast.success('Biyometrik giriş etkinleştirildi! 🎉');
    } else {
      toast.error('Biyometrik giriş etkinleştirilemedi');
    }
    
    navigate('/dashboard');
  };

  // Dialog'da "Hayır" dediğinde
  const handleSkipBiometric = () => {
    setShowBiometricDialog(false);
    navigate('/dashboard');
  };

  // Session kontrol ediliyor, loading göster
  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Oturum kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Tekrar Hoş Geldiniz</CardTitle>
          <CardDescription>Aile görevlerinizi yönetmek için giriş yapın</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Link to="/reset-password" className="text-sm text-primary hover:underline">
              Şifremi unuttum
            </Link>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>

            {/* Biometric Button */}
            {isMobile && isAvailable && isEnabled && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleBiometricLogin}
                disabled={loading}
              >
                <Fingerprint className="h-5 w-5" />
                {biometryType === 'face' ? 'Yüz Tanıma' : 'Parmak İzi'} ile Giriş
              </Button>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Hesabınız yok mu?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Kayıt ol
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Biometric Etkinleştirme Dialog'u */}
      <AlertDialog open={showBiometricDialog} onOpenChange={setShowBiometricDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5" />
              Biyometrik Giriş
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bir dahaki sefere {biometryType === 'face' ? 'yüz tanıma' : 'parmak izi'} ile 
              hızlıca giriş yapmak ister misiniz? Bu özelliği daha sonra ayarlardan 
              değiştirebilirsiniz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleSkipBiometric}>
              Şimdi Değil
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleEnableBiometric}>
              Etkinleştir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Login;
