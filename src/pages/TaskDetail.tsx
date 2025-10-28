import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Trash2, MessageCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { supabase } from '@/integrations/supabase/client';
import { Task, Profile } from '@/types';
import { toast } from 'sonner';

const TaskDetail = () => {
  const { id } = useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { completeTask, deleteTask } = useTaskMutations();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  useEffect(() => {
    if (id) {
      loadTask();
      loadComments();
    }
  }, [id]);

  const loadTask = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    if (data) {
      setTask(data as Task);
      loadProfiles([data.created_by, ...(data.assigned_to || [])]);
    }
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', id)
      .order('created_at', { ascending: true });
    if (data) {
      setComments(data);
      const userIds = data.map(c => c.user_id);
      loadProfiles(userIds);
    }
  };

  const loadProfiles = async (userIds: string[]) => {
    const uniqueIds = [...new Set(userIds)];
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('id', uniqueIds);
    if (data) {
      const profileMap: Record<string, Profile> = {};
      data.forEach((p: any) => {
        profileMap[p.id] = p as Profile;
      });
      setProfiles(prev => ({ ...prev, ...profileMap }));
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const { error } = await supabase
      .from('task_comments')
      .insert({
        task_id: id,
        user_id: user!.id,
        comment: newComment,
      });

    if (error) {
      toast.error('Yorum eklenemedi');
    } else {
      setNewComment('');
      loadComments();
      toast.success('Yorum eklendi');
    }
  };

  const handleComplete = () => {
    if (task) {
      completeTask.mutate({ taskId: task.id, userId: user!.id });
      loadTask();
    }
  };

  const handleDelete = async () => {
    if (task && window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      await deleteTask.mutateAsync(task.id);
      navigate('/tasks');
    }
  };

  if (!task) {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/tasks')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Görev Detayları</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Link to="/dashboard"><Button variant="ghost">Pano</Button></Link>
            <Link to="/tasks"><Button variant="ghost">Görevler</Button></Link>
            <Link to="/calendar"><Button variant="ghost">Takvim</Button></Link>
            <Link to="/family"><Button variant="ghost">Aile</Button></Link>
            <Link to="/profile"><Button variant="ghost">Profil</Button></Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">{task.title}</CardTitle>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                    {task.status === 'completed' ? 'Tamamlandı' : task.status === 'in_progress' ? 'Devam Ediyor' : 'Bekliyor'}
                  </Badge>
                  <Badge variant="outline">
                    {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                  </Badge>
                  <Badge>{task.points} puan</Badge>
                  {task.due_date && (
                    <Badge variant="secondary">
                      Son: {new Date(task.due_date).toLocaleDateString('tr-TR')}
                    </Badge>
                  )}
                </div>
              </div>
              {task.status !== 'completed' && (
                <Button onClick={handleComplete}>Görevi Tamamla</Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {task.description && (
              <div>
                <h3 className="font-semibold mb-2">Açıklama</h3>
                <p className="text-muted-foreground">{task.description}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Atanan Kişiler</h3>
              <div className="flex flex-wrap gap-2">
                {task.assigned_to.map((userId) => (
                  <Badge key={userId} variant="outline">
                    {profiles[userId]?.display_name || 'Yükleniyor...'}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Oluşturan</h3>
              <p className="text-muted-foreground">
                {profiles[task.created_by]?.display_name || 'Yükleniyor...'}
              </p>
            </div>

            {task.completed_by && (
              <div>
                <h3 className="font-semibold mb-2">Tamamlayan</h3>
                <p className="text-muted-foreground">
                  {profiles[task.completed_by]?.display_name || 'Yükleniyor...'} -{' '}
                  {new Date(task.completed_at!).toLocaleDateString('tr-TR')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Yorumlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-l-2 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {profiles[comment.user_id]?.display_name || 'Yükleniyor...'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-sm">{comment.comment}</p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <Textarea
                placeholder="Yorum ekleyin..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                Yorum Ekle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskDetail;