import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Profile as ProfileType, UserRole } from '@/types';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useAuth();
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
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
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
      case 'first_task': return 'First Task';
      case 'week_star': return 'Week Star';
      case 'super_team': return 'Super Team';
      case 'consistent': return 'Consistent';
      default: return badgeType;
    }
  };

  if (!profile) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">My Profile</h1>

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
                  <Badge className="mt-2">{profile.role}</Badge>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <span className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Points
                    </span>
                    <span className="text-xl font-bold">{profile.points}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                    <span className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Badges
                    </span>
                    <span className="text-xl font-bold">{badges.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Badges</CardTitle>
          </CardHeader>
          <CardContent>
            {badges.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No badges earned yet. Complete tasks to earn badges!
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {badges.map((badge) => (
                  <div key={badge.id} className="border rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">{getBadgeIcon(badge.badge_type)}</div>
                    <h3 className="font-semibold">{getBadgeName(badge.badge_type)}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Earned {new Date(badge.earned_at).toLocaleDateString()}
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
