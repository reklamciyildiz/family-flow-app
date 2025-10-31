import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, CheckCircle2, Clock, Plus, Trophy, Users, LogOut, TrendingUp, Target, Zap, Award } from 'lucide-react';
import type { Task, Profile } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FamilySetup } from '@/components/family/FamilySetup';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [familyMembers, setFamilyMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.family_id) {
      loadTasks();
      loadFamilyMembers();

      // Realtime subscription for tasks and profiles
      const tasksChannel = supabase
        .channel('tasks-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `family_id=eq.${profile.family_id}` 
        }, () => {
          loadTasks();
        })
        .subscribe();

      const profilesChannel = supabase
        .channel('profiles-changes')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `family_id=eq.${profile.family_id}` 
        }, () => {
          loadFamilyMembers();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(tasksChannel);
        supabase.removeChannel(profilesChannel);
      };
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    if (!profile?.family_id) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []) as Task[]);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadFamilyMembers = async () => {
    if (!profile?.family_id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('points', { ascending: false });

      if (error) throw error;
      setFamilyMembers((data || []) as Profile[]);
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile?.family_id) {
    return <FamilySetup onComplete={loadProfile} userId={user!.id} />;
  }

  const todayTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    const taskDate = new Date(task.due_date);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  });

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-accent text-accent-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-3 md:p-8 pb-24 md:pb-8 overflow-x-hidden">
      <div className="mx-auto max-w-7xl space-y-4 md:space-y-8 w-full overflow-x-hidden">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Aile Panosu
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1 truncate">
                Hoş geldin, <span className="font-semibold text-foreground">{profile.display_name}</span>! 👋
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link to="/tasks/new" className="hidden md:block">
                <Button className="shadow-lg hover:shadow-xl transition-shadow">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Görev
                </Button>
              </Link>
              <Button variant="outline" size="icon" onClick={signOut} className="md:hidden">
                <LogOut className="h-5 w-5" />
              </Button>
              <Button variant="outline" onClick={signOut} className="hidden md:flex">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </Button>
            </div>
          </div>
          
          <div className="hidden md:flex gap-2 overflow-x-auto pb-2">
            <Link to="/dashboard"><Button variant="secondary">Pano</Button></Link>
            <Link to="/tasks"><Button variant="ghost">Görevler</Button></Link>
            <Link to="/calendar"><Button variant="ghost">Takvim</Button></Link>
            <Link to="/family"><Button variant="ghost">Aile</Button></Link>
            <Link to="/profile"><Button variant="ghost">Profil</Button></Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-3 md:gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bugünün Görevleri</CardTitle>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{todayTasks.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {todayTasks.filter(t => t.status === 'completed').length} tamamlandı ✓
                </p>
                <Progress value={todayTasks.length > 0 ? (todayTasks.filter(t => t.status === 'completed').length / todayTasks.length) * 100 : 0} className="mt-3" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tamamlanma Oranı</CardTitle>
                <div className="p-2 bg-green-500 rounded-lg">
                  <Target className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">{Math.round(completionRate)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedTasks} / {tasks.length} görev
                </p>
                <Progress value={completionRate} className="mt-3" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aile Üyeleri</CardTitle>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{familyMembers.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Aktif üye 👥</p>
                <div className="flex -space-x-2 mt-3">
                  {familyMembers.slice(0, 5).map((member) => (
                    <Avatar key={member.id} className="w-6 h-6 border-2 border-background">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">{member.display_name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-500" />
                      Bugünün Görevleri
                    </CardTitle>
                    <CardDescription>Bugün teslim edilecek görevler</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3">
                    {todayTasks.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Bugün teslim edilecek görev yok</p>
                    <p className="text-sm text-muted-foreground mt-1">Harika iş! 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md active:scale-[0.98] bg-gradient-to-r from-background to-muted/20"
                      >
                        <div className="flex items-start justify-between gap-3 md:gap-4">
                          <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 ${
                              task.status === 'completed' 
                                ? 'bg-green-100 dark:bg-green-900' 
                                : 'bg-blue-100 dark:bg-blue-900'
                            }`}>
                              {task.status === 'completed' ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                              ) : (
                                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm md:text-base truncate mb-1">{task.title}</h3>
                              {task.description && (
                                <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 mb-2">{task.description}</p>
                              )}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge className={`${getPriorityColor(task.priority)} text-xs whitespace-nowrap`}>
                                  {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                                </Badge>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs whitespace-nowrap">
                                  ⚡ {task.points}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Family Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-2 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  Lider Tablosu
                </CardTitle>
                <CardDescription>Bu haftanın şampiyonları 🏆</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {familyMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`
                      flex items-center gap-4 p-3 rounded-xl transition-all
                      ${index === 0 ? 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 border-2 border-amber-300 shadow-md' : 
                        index === 1 ? 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 border border-gray-300' :
                        index === 2 ? 'bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 border border-orange-300' :
                        'bg-background/50 border border-border'}
                    `}
                  >
                    <div className={`
                      flex h-10 w-10 items-center justify-center rounded-full font-bold text-lg
                      ${index === 0 ? 'bg-amber-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-muted text-muted-foreground'}
                    `}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>
                    <Avatar className={index < 3 ? 'ring-2 ring-offset-2 ring-amber-400' : ''}>
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="font-bold">{member.display_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{member.display_name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-bold text-lg ${
                        index === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-primary'
                      }`}>
                        {member.points}
                      </span>
                      <span className="text-xs text-muted-foreground">puan</span>
                    </div>
                  </motion.div>
                ))}
                
                {familyMembers.length === 0 && (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Henüz üye yok</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Floating Action Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
          className="fixed bottom-24 right-8 md:bottom-8 z-60"
        >
          <Link to="/tasks/new">
            <Button
              size="lg"
              className="rounded-full w-16 h-16 shadow-2xl hover:scale-110 transition-transform"
            >
              <Plus className="h-8 w-8" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
