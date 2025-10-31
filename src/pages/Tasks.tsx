import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, CheckCircle2, Clock, AlertCircle, LogOut, Filter, ListTodo, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Task, Profile, TaskStatus, TaskPriority } from '@/types';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Tasks = () => {
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const { completeTask } = useTaskMutations();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.family_id) {
      loadTasks();

      // Realtime subscription for tasks
      const tasksChannel = supabase
        .channel('tasks-list-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `family_id=eq.${profile.family_id}` 
        }, () => {
          loadTasks();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(tasksChannel);
      };
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

  const loadTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('family_id', profile!.family_id)
      .order('due_date', { ascending: true });
    if (data) setTasks(data as Task[]);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleComplete = (taskId: string, taskPoints: number) => {
    completeTask.mutate({ taskId, userId: user!.id, taskPoints });
  };

  // Kullanıcının görevi tamamlama yetkisi var mı?
  const canCompleteTask = (task: Task) => {
    if (!user) return false;
    
    // Görev zaten tamamlanmışsa tamamlayamaz
    if (task.status === 'completed') return false;
    
    // Kullanıcı göreve atanmışsa tamamlayabilir
    if (task.assigned_to.includes(user.id)) return true;
    
    // Kullanıcı görevi oluşturmuşsa VE kimseye atanmamışsa tamamlayabilir
    if (task.created_by === user.id && task.assigned_to.length === 0) return true;
    
    return false;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-accent text-accent-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-warning" />;
      default: return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-3 md:p-8 pb-24 md:pb-8 overflow-x-hidden">
      <div className="mx-auto max-w-7xl space-y-4 md:space-y-6 w-full overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
                <ListTodo className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
                <span className="truncate">Görevler</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">Aile görevlerinizi yönetin</p>
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
            <Link to="/dashboard"><Button variant="ghost">Pano</Button></Link>
            <Link to="/tasks"><Button variant="secondary">Görevler</Button></Link>
            <Link to="/calendar"><Button variant="ghost">Takvim</Button></Link>
            <Link to="/family"><Button variant="ghost">Aile</Button></Link>
            <Link to="/profile"><Button variant="ghost">Profil</Button></Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 shadow-lg bg-gradient-to-r from-background to-muted/20">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Filter className="h-4 w-4 md:h-5 md:w-5" />
                Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-3 md:gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="🔍 Görev ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-2 h-11 md:h-10 text-base md:text-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
                  <SelectTrigger className="w-full md:w-[180px] border-2 h-11 md:h-10 text-base md:text-sm">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="pending">⏳ Bekliyor</SelectItem>
                    <SelectItem value="in_progress">⚡ Devam Ediyor</SelectItem>
                    <SelectItem value="completed">✅ Tamamlandı</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
                  <SelectTrigger className="w-full md:w-[180px] border-2 h-11 md:h-10 text-base md:text-sm">
                    <SelectValue placeholder="Öncelik" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Öncelikler</SelectItem>
                    <SelectItem value="low">🟢 Düşük</SelectItem>
                    <SelectItem value="medium">🟡 Orta</SelectItem>
                    <SelectItem value="high">🔴 Yüksek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>{filteredTasks.length} görev bulundu</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="border-2">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-xl font-semibold mb-2">Görev bulunamadı</p>
                  <p className="text-muted-foreground mb-6">Arama kriterlerinizi değiştirin veya yeni görev oluşturun</p>
                  <Link to="/tasks/new">
                    <Button size="lg" className="shadow-lg">
                      <Plus className="mr-2 h-5 w-5" />
                      İlk Görevinizi Oluşturun
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-3 md:gap-4">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                  className="w-full"
                >
                  <Link to={`/tasks/${task.id}`} className="block w-full">
                    <Card className="border-2 hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-r from-background to-muted/10 active:scale-[0.98] overflow-hidden w-full">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 md:p-6 overflow-hidden">
                        <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0 overflow-hidden">
                          <div className={`
                            flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0
                            ${task.status === 'completed' 
                              ? 'bg-green-100 dark:bg-green-900' 
                              : task.status === 'in_progress'
                              ? 'bg-blue-100 dark:bg-blue-900'
                              : 'bg-gray-100 dark:bg-gray-800'}
                            group-hover:scale-110 transition-transform
                          `}>
                            {getStatusIcon(task.status)}
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <CardTitle className="text-lg md:text-xl mb-1 md:mb-2 truncate group-hover:text-primary transition-colors">
                              {task.title}
                            </CardTitle>
                            {task.description && (
                              <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 md:line-clamp-2 mb-2 md:mb-3">
                                {task.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                              <Badge className={`${getPriorityColor(task.priority)} text-xs md:text-sm whitespace-nowrap`}>
                                {task.priority === 'high' ? '🔴' : 
                                 task.priority === 'medium' ? '🟡' : 
                                 '🟢'}
                                <span className="hidden md:inline ml-1">
                                  {task.priority === 'high' ? 'Yüksek' : 
                                   task.priority === 'medium' ? 'Orta' : 
                                   'Düşük'}
                                </span>
                              </Badge>
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs md:text-sm whitespace-nowrap">
                                ⚡ {task.points}
                              </Badge>
                              {task.due_date && (
                                <Badge variant="secondary" className="text-xs md:text-sm whitespace-nowrap max-w-[120px] md:max-w-none truncate">
                                  📅 {format(new Date(task.due_date), 'd MMM', { locale: tr })}
                                  <span className="hidden md:inline">
                                    {' '}{format(new Date(task.due_date), 'HH:mm')}
                                  </span>
                                </Badge>
                              )}
                              {task.status === 'completed' && (
                                <Badge className="bg-green-500 text-white text-xs md:text-sm whitespace-nowrap">
                                  ✅ <span className="hidden md:inline">Tamamlandı</span>
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {canCompleteTask(task) && (
                          <Button
                            size="sm"
                            className="shadow-md hover:shadow-lg transition-shadow flex-shrink-0"
                            onClick={(e) => {
                              e.preventDefault();
                              handleComplete(task.id, task.points);
                            }}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Tamamla
                          </Button>
                        )}
                      </CardHeader>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
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

export default Tasks;