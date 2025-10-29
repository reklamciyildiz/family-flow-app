import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Copy, CheckCircle, LogOut, UserPlus, Trophy, Crown, Baby, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

const Family = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [family, setFamily] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<Profile[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.family_id) {
      loadFamily();
      loadFamilyMembers();
    }
  }, [profile]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    if (data) setProfile(data as Profile);
  };

  const loadFamily = async () => {
    const { data } = await supabase
      .from('families')
      .select('*')
      .eq('id', profile!.family_id)
      .single();
    if (data) setFamily(data);
  };

  const loadFamilyMembers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('family_id', profile!.family_id)
      .order('points', { ascending: false });
    if (data) setFamilyMembers(data as Profile[]);
  };

  const copyInviteCode = () => {
    if (family?.invite_code) {
      navigator.clipboard.writeText(family.invite_code);
      setCopied(true);
      toast.success('Davet kodu kopyalandı!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'parent': return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';
      case 'child': return 'bg-gradient-to-r from-green-500 to-teal-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'parent': return <Crown className="h-4 w-4" />;
      case 'child': return <Baby className="h-4 w-4" />;
      default: return <UserIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8 pb-24 md:pb-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary rounded-xl">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Aile
                </h1>
                <p className="text-sm text-muted-foreground">Aile üyelerini yönet ve davet et</p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
          
          <div className="hidden md:flex gap-2 overflow-x-auto pb-2">
            <Link to="/dashboard"><Button variant="ghost">Pano</Button></Link>
            <Link to="/tasks"><Button variant="ghost">Görevler</Button></Link>
            <Link to="/calendar"><Button variant="ghost">Takvim</Button></Link>
            <Link to="/family"><Button variant="secondary">Aile</Button></Link>
            <Link to="/profile"><Button variant="ghost">Profil</Button></Link>
          </div>
        </motion.div>

        {family && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  {family.name}
                </CardTitle>
                <CardDescription>
                  Oluşturulma: {format(parseISO(family.created_at), "d MMMM yyyy", { locale: tr })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 bg-background rounded-xl border-2 border-primary/20 shadow-inner">
                  <div className="flex items-center gap-2 mb-3">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <p className="font-semibold">Davet Kodu</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 bg-muted p-4 rounded-lg font-mono text-2xl font-bold text-center tracking-widest border-2">
                      {family.invite_code}
                    </code>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={copyInviteCode}
                      className="shadow-md hover:shadow-lg transition-all hover:scale-105"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                          Kopyalandı!
                        </>
                      ) : (
                        <>
                          <Copy className="h-5 w-5 mr-2" />
                          Kopyala
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                    💡 Aile üyelerini davet etmek için bu kodu paylaşın
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    Aile Üyeleri
                  </CardTitle>
                  <CardDescription>Ailenizde {familyMembers.length} üye var</CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {familyMembers.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {familyMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-center gap-4 p-4 border-2 rounded-xl hover:shadow-lg transition-all bg-gradient-to-r from-background to-muted/10 group"
                  >
                    <Avatar className="h-14 w-14 ring-2 ring-offset-2 ring-primary/30 group-hover:ring-primary transition-all">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="text-lg font-bold">
                        {member.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-lg truncate">{member.display_name}</p>
                        {member.id === user?.id && (
                          <Badge variant="secondary" className="bg-primary text-primary-foreground">
                            👤 Siz
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getRoleColor(member.role)}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1">
                            {member.role === 'parent' ? 'Ebeveyn' : member.role === 'child' ? 'Çocuk' : 'Diğer'}
                          </span>
                        </Badge>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                          <Trophy className="h-3 w-3 mr-1" />
                          {member.points} puan
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {familyMembers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">Henüz aile üyesi yok</p>
                    <p className="text-sm">Davet kodunu paylaşarak üye ekleyin! 👨‍👩‍👧‍👦</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Family;