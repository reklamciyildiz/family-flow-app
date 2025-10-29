import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, LogOut, User, Crown, Baby, Save, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Profile as ProfileType, UserRole } from '@/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

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

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary rounded-xl">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Profilim
                </h1>
                <p className="text-sm text-muted-foreground">Profil ayarlarını düzenle</p>
              </div>
            </div>
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
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1"
          >
            <Card className="border-2 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <Avatar className="h-28 w-28 ring-4 ring-primary ring-offset-4 shadow-xl">
                      <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-purple-600 text-white">
                        {profile.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">{profile.display_name}</h2>
                    <Badge className={`
                      ${profile.role === 'parent' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 
                        profile.role === 'child' ? 'bg-gradient-to-r from-green-500 to-teal-500' : 
                        'bg-muted'} text-white text-sm px-3 py-1
                    `}>
                      {profile.role === 'parent' ? (
                        <><Crown className="h-3 w-3 mr-1 inline" /> Ebeveyn</>
                      ) : profile.role === 'child' ? (
                        <><Baby className="h-3 w-3 mr-1 inline" /> Çocuk</>
                      ) : (
                        'Diğer'
                      )}
                    </Badge>
                  </div>
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 rounded-xl border-2 border-amber-300 shadow-md">
                      <span className="flex items-center gap-2 font-semibold">
                        <Trophy className="h-5 w-5 text-amber-600" />
                        Puan
                      </span>
                      <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">{profile.points}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-xl border-2 border-purple-300 shadow-md">
                      <span className="flex items-center gap-2 font-semibold">
                        <Award className="h-5 w-5 text-purple-600" />
                        Rozetler
                      </span>
                      <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">{badges.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Profili Düzenle
                </CardTitle>
                <CardDescription>Profil bilgilerini güncelle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-base font-semibold">Görünen Ad</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="border-2 h-12 text-base"
                    placeholder="Adınızı girin..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-base font-semibold">Rol</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger className="border-2 h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Ebeveyn
                        </div>
                      </SelectItem>
                      <SelectItem value="child">
                        <div className="flex items-center gap-2">
                          <Baby className="h-4 w-4" />
                          Çocuk
                        </div>
                      </SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSave} 
                  disabled={loading} 
                  className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-shadow"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    Rozetlerim
                  </CardTitle>
                  <CardDescription>Kazandığınız başarı rozetleri</CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {badges.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {badges.length === 0 ? (
                <div className="text-center py-16">
                  <Award className="h-20 w-20 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-xl font-semibold mb-2">Henüz rozet kazanılmadı</p>
                  <p className="text-muted-foreground mb-6">
                    Rozet kazanmak için görevleri tamamlayın! 🎯
                  </p>
                  <Link to="/tasks">
                    <Button size="lg">
                      <Trophy className="mr-2 h-5 w-5" />
                      Görevlere Git
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {badges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="border-2 rounded-xl p-6 text-center hover:shadow-lg transition-all bg-gradient-to-br from-background to-muted/10 group"
                    >
                      <motion.div 
                        className="text-6xl mb-3 group-hover:scale-110 transition-transform"
                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        {getBadgeIcon(badge.badge_type)}
                      </motion.div>
                      <h3 className="font-bold text-lg mb-1">{getBadgeName(badge.badge_type)}</h3>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(badge.earned_at), "d MMMM yyyy", { locale: tr })}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;