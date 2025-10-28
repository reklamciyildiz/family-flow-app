import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Copy, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';
import { toast } from 'sonner';

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
      case 'parent': return 'bg-primary text-primary-foreground';
      case 'child': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              <h1 className="text-3xl font-bold">Aile</h1>
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
            <Link to="/family"><Button variant="secondary">Aile</Button></Link>
            <Link to="/profile"><Button variant="ghost">Profil</Button></Link>
          </div>
        </div>

        {family && (
          <Card>
            <CardHeader>
              <CardTitle>{family.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Davet Kodu</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted p-3 rounded-lg font-mono text-lg">
                    {family.invite_code}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyInviteCode}>
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Aile üyelerini davet etmek için bu kodu paylaşın
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Oluşturulma Tarihi</p>
                <p className="font-medium">{new Date(family.created_at).toLocaleDateString('tr-TR')}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Aile Üyeleri ({familyMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{member.display_name}</p>
                      {member.id === user?.id && (
                        <Badge variant="secondary">Siz</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getRoleColor(member.role)}>
                        {member.role === 'parent' ? 'Ebeveyn' : member.role === 'child' ? 'Çocuk' : 'Diğer'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {member.points} puan
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Family;