import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Profile as ProfileType, UserRole } from '@/types';
import { toast } from 'sonner';

const Profile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('other');
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadBadges();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    if (data) {
      setProfile(data as ProfileType);
      setDisplayName(data.display_name);
      setRole(data.role as UserRole);
    }
  };

  const loadBadges = async () => {
    const { data } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', user?.id)
      .order('earned_at', { ascending: false });
    if (data) setBadges(data);
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        role: role,
      })
      .eq('id', user?.id);

    if (error) {
      toast.error('Profil güncellenemedi');
    } else {
      toast.success('Profil başarıyla güncellendi!');
      loadProfile();
    }
    setLoading(false);
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'first_task': return '🎯';
      case 'week_star': return '⭐';
      case 'super_team': return '🏆';
      case 'consistent': return '🔥';
      default: return '🏅';
    }
  };

  const getBadgeName = (badgeType: string) => {
    switch (badgeType) {
      case 'first_task': return 'İlk Görev';
      case 'week_star': return 'Haftanın Yıldızı';
      case 'super_team': return 'Süper Takım';
      case 'consistent': return 'Kararlı';
      default: return badgeType;
    }
  };

  if (!profile) return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Profilim</h1>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Link to="/dashboard"><Button variant="ghost">Pano</Button></Link>
            <Link to="/tasks"><Button variant="ghost">Görevler</Button></Link>
            <Link to="/calendar"><Button variant="ghost">Takvim</Button></Link>
            <Link to="/family"><Button variant="ghost">Aile</Button></Link>
            <Link to="/profile"><Button variant="secondary">Profil</Button></Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-3xl">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{profile.display_name}</h2>
                  <Badge className="mt-2">
                    {profile.role === 'parent' ? 'Ebeveyn' : profile.role === 'child' ? 'Çocuk' : 'Diğer'}
                  </Badge>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <span className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Puan
                    </span>
                    <span className="text-xl font-bold">{profile.points}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                    <span className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Rozetler
                    </span>
                    <span className="text-xl font-bold">{badges.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profili Düzenle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Görünen Ad</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Ebeveyn</SelectItem>
                    <SelectItem value="child">Çocuk</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rozetlerim</CardTitle>
          </CardHeader>
          <CardContent>
            {badges.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Henüz rozet kazanılmadı. Rozet kazanmak için görevleri tamamlayın!
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {badges.map((badge) => (
                  <div key={badge.id} className="border rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">{getBadgeIcon(badge.badge_type)}</div>
                    <h3 className="font-semibold">{getBadgeName(badge.badge_type)}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(badge.earned_at).toLocaleDateString('tr-TR')} tarihinde kazanıldı
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;