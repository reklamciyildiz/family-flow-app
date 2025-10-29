import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Trash2, MessageCircle, LogOut, Calendar, User, CheckCircle2, Clock, Zap, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { supabase } from '@/integrations/supabase/client';
import { Task, Profile } from '@/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

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
      completeTask.mutate({ taskId: task.id, userId: user!.id, taskPoints: task.points });
      loadTask();
    }
  };

  // Kullanıcının görevi tamamlama yetkisi var mı?
  const canCompleteTask = () => {
    if (!task || !user) return false;
    
    // Görev zaten tamamlanmışsa tamamlayamaz
    if (task.status === 'completed') return false;
    
    // Kullanıcı göreve atanmışsa tamamlayabilir
    if (task.assigned_to.includes(user.id)) return true;
    
    // Kullanıcı görevi oluşturmuşsa VE kimseye atanmamışsa tamamlayabilir
    if (task.created_by === user.id && task.assigned_to.length === 0) return true;
    
    return false;
  };

  const handleDelete = async () => {
    if (task && window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      await deleteTask.mutateAsync(task.id);
      navigate('/tasks');
    }
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-950';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-950';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/tasks')} className="hover:scale-110 transition-transform">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Görev Detayları
                </h1>
                <p className="text-sm text-muted-foreground">Görevi incele, yönet ve tamamla</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" size="icon" onClick={handleDelete} className="hover:scale-110 transition-transform">
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`border-l-8 ${getPriorityColor()} border-2 shadow-xl`}>
            <CardHeader>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-xl ${
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
                      <CardTitle className="text-2xl md:text-3xl truncate">{task.title}</CardTitle>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}>
                      {task.status === 'completed' ? '✅ Tamamlandı' : task.status === 'in_progress' ? '⚡ Devam Ediyor' : '⏳ Bekliyor'}
                    </Badge>
                    <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                      {task.priority === 'high' ? '🔴 Yüksek' : task.priority === 'medium' ? '🟡 Orta' : '🟢 Düşük'} Öncelik
                    </Badge>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                      <Zap className="h-3 w-3 mr-1" />
                      {task.points} puan
                    </Badge>
                    {task.due_date && (
                      <Badge variant="secondary" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(parseISO(task.due_date), "d MMMM yyyy, HH:mm", { locale: tr })}
                      </Badge>
                    )}
                  </div>
                </div>
                {canCompleteTask() && (
                  <Button size="lg" onClick={handleComplete} className="shadow-lg hover:shadow-xl transition-shadow">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Görevi Tamamla
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {task.description && (
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Açıklama
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{task.description}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Atanan Kişiler
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.assigned_to.length > 0 ? (
                      task.assigned_to.map((userId) => (
                        <div key={userId} className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={profiles[userId]?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">{profiles[userId]?.display_name?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{profiles[userId]?.display_name || 'Yükleniyor...'}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Kimseye atanmadı</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Oluşturan
                  </h3>
                  <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={profiles[task.created_by]?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">{profiles[task.created_by]?.display_name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {profiles[task.created_by]?.display_name || 'Yükleniyor...'}
                    </span>
                  </div>
                </div>
              </div>

              {task.completed_by && (
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-xl border-2 border-green-200 dark:border-green-800">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Tamamlandı
                  </h3>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profiles[task.completed_by]?.avatar_url || undefined} />
                      <AvatarFallback>{profiles[task.completed_by]?.display_name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{profiles[task.completed_by]?.display_name || 'Yükleniyor...'}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(task.completed_at!), "d MMMM yyyy, HH:mm", { locale: tr })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Yorumlar
                </CardTitle>
                <Badge variant="secondary">{comments.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnimatePresence mode="popLayout">
                {comments.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-3 p-4 bg-muted/50 rounded-xl border border-border hover:shadow-md transition-shadow"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={profiles[comment.user_id]?.avatar_url || undefined} />
                          <AvatarFallback>{profiles[comment.user_id]?.display_name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {profiles[comment.user_id]?.display_name || 'Yükleniyor...'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(comment.created_at), "d MMM, HH:mm", { locale: tr })}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{comment.comment}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Henüz yorum yok</p>
                    <p className="text-xs">İlk yorumu siz yapın! 💬</p>
                  </div>
                )}
              </AnimatePresence>

              <Separator />

              <div className="space-y-3">
                <Textarea
                  placeholder="Yorumunuzu yazın... 💭"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="resize-none border-2"
                />
                <Button 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim()}
                  className="w-full md:w-auto shadow-md hover:shadow-lg transition-shadow"
                  size="lg"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Yorum Gönder
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TaskDetail;