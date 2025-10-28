import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, Trophy, Users, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
              <Users className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
              Aile Görev Yöneticisi
            </h1>
            <p className="text-xl text-muted-foreground md:text-2xl max-w-2xl mx-auto">
              Birlikte koordine edin, işbirliği yapın ve kutlayın. Görevler, ödüller ve dostane rekabet ile aile organizasyonunu eğlenceli hale getirin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8">
                Başlayın
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CalendarCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Görev Yönetimi</CardTitle>
              <CardDescription>
                Son teslim tarihleri ve önceliklerle görevler oluşturun, atayın ve takip edin
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Trophy className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Oyunlaştırma</CardTitle>
              <CardDescription>
                Puan kazanın, rozetler açın ve aile lider tablosunda yükselın
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <Zap className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>Gerçek Zamanlı Güncellemeler</CardTitle>
              <CardDescription>
                Anlık bildirimler ve canlı güncellemelerle senkronize kalın
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <CardTitle>Aile Öncelikli</CardTitle>
              <CardDescription>
                Ailelerin sorunsuzca bağlantı kurması ve birlikte çalışması için tasarlandı
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
