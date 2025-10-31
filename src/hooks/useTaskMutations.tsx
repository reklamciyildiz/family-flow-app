import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Task } from '@/types';
import { useLocalNotifications } from './useLocalNotifications';
import { getNotificationService } from '@/services/notificationService';

export const useTaskMutations = () => {
  const queryClient = useQueryClient();
  const notificationHook = useLocalNotifications();
  const notificationService = getNotificationService(notificationHook);

  const createTask = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'created_at' | 'completed_at' | 'completed_by'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev oluşturuldu!');
      
      // Deadline varsa bildirimleri zamanla
      if (data) {
        await notificationService.scheduleTaskDeadlineReminders(data as Task);
        
        // Tekrar eden görevse hatırlatma ekle
        if ((data as Task).repeat_type !== 'none') {
          await notificationService.scheduleRecurringTaskReminder(data as Task);
        }
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Görev oluşturulamadı');
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev güncellendi!');
      
      // Deadline güncellendiysе bildirimleri yeniden zamanla
      if (data && 'due_date' in data) {
        await notificationService.onTaskDeadlineUpdated(data as Task);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Görev güncellenemedi');
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: async (id) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev silindi!');
      
      // Görev silindiğinde tüm bildirimleri iptal et
      if (id) {
        await notificationService.onTaskDeleted(id);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Görev silinemedi');
    },
  });

  const completeTask = useMutation({
    mutationFn: async ({ taskId, userId, taskPoints }: { taskId: string; userId: string; taskPoints: number }) => {
      // Update task as completed
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_by: userId,
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (taskError) throw taskError;

      // Get user's current points
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Update user's points
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: (profile.points || 0) + taskPoints })
        .eq('id', userId);

      if (updateError) throw updateError;

      return { taskData, taskId };
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success(`🎉 Görev tamamlandı! +${variables.taskPoints} puan kazandın!`);
      
      // Görev tamamlandığında bildirimleri iptal et
      if (data.taskId) {
        await notificationService.onTaskCompleted(data.taskId);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Görev tamamlanamadı');
    },
  });

  return {
    createTask,
    updateTask,
    deleteTask,
    completeTask,
  };
};
