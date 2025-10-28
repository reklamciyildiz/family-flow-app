import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Trash2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { supabase } from '@/integrations/supabase/client';
import { Task, Profile } from '@/types';
import { toast } from 'sonner';

const TaskDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
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
      toast.error('Failed to add comment');
    } else {
      setNewComment('');
      loadComments();
      toast.success('Comment added');
    }
  };

  const handleComplete = () => {
    if (task) {
      completeTask.mutate({ taskId: task.id, userId: user!.id });
      loadTask();
    }
  };

  const handleDelete = async () => {
    if (task && window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask.mutateAsync(task.id);
      navigate('/tasks');
    }
  };

  if (!task) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tasks')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold flex-1">Task Details</h1>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">{task.title}</CardTitle>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                    {task.status}
                  </Badge>
                  <Badge variant="outline">{task.priority}</Badge>
                  <Badge>{task.points} points</Badge>
                  {task.due_date && (
                    <Badge variant="secondary">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
              {task.status !== 'completed' && (
                <Button onClick={handleComplete}>Complete Task</Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {task.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{task.description}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Assigned To</h3>
              <div className="flex flex-wrap gap-2">
                {task.assigned_to.map((userId) => (
                  <Badge key={userId} variant="outline">
                    {profiles[userId]?.display_name || 'Loading...'}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Created By</h3>
              <p className="text-muted-foreground">
                {profiles[task.created_by]?.display_name || 'Loading...'}
              </p>
            </div>

            {task.completed_by && (
              <div>
                <h3 className="font-semibold mb-2">Completed By</h3>
                <p className="text-muted-foreground">
                  {profiles[task.completed_by]?.display_name || 'Loading...'} on{' '}
                  {new Date(task.completed_at!).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-l-2 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {profiles[comment.user_id]?.display_name || 'Loading...'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.comment}</p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                Add Comment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskDetail;
