import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, CheckCircle2, Clock, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Task, Profile, TaskStatus, TaskPriority } from '@/types';
import { useTaskMutations } from '@/hooks/useTaskMutations';

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

  const handleComplete = (taskId: string) => {
    completeTask.mutate({ taskId, userId: user!.id });
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Görevler</h1>
              <p className="text-muted-foreground">Aile görevlerinizi yönetin</p>
            </div>
            <div className="flex gap-2">
              <Link to="/tasks/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Görev
                </Button>
              </Link>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Link to="/dashboard"><Button variant="ghost">Pano</Button></Link>
            <Link to="/tasks"><Button variant="secondary">Görevler</Button></Link>
            <Link to="/calendar"><Button variant="ghost">Takvim</Button></Link>
            <Link to="/family"><Button variant="ghost">Aile</Button></Link>
            <Link to="/profile"><Button variant="ghost">Profil</Button></Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Görev ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="pending">Bekliyor</SelectItem>
              <SelectItem value="in_progress">Devam Ediyor</SelectItem>
              <SelectItem value="completed">Tamamlandı</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Öncelik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Öncelikler</SelectItem>
              <SelectItem value="low">Düşük</SelectItem>
              <SelectItem value="medium">Orta</SelectItem>
              <SelectItem value="high">Yüksek</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Görev bulunamadı</p>
                <Link to="/tasks/new">
                  <Button className="mt-4" variant="outline">İlk görevinizi oluşturun</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Link key={task.id} to={`/tasks/${task.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getStatusIcon(task.status)}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        {task.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          <Badge variant="outline">{task.points} puan</Badge>
                          {task.due_date && (
                            <Badge variant="secondary">
                              Son: {new Date(task.due_date).toLocaleDateString('tr-TR')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {task.status !== 'completed' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleComplete(task.id);
                        }}
                      >
                        Tamamla
                      </Button>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;