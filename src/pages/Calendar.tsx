import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Task, Profile } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { tr } from 'date-fns/locale';

const Calendar = () => {
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.family_id) {
      loadTasks();
    }
  }, [profile, currentDate]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    if (data) setProfile(data as Profile);
  };

  const loadTasks = async () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('family_id', profile!.family_id)
      .gte('due_date', start.toISOString())
      .lte('due_date', end.toISOString());
    
    if (data) setTasks(data as Task[]);
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => task.due_date && isSameDay(new Date(task.due_date), day));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-accent text-accent-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              <h1 className="text-3xl font-bold">Takvim</h1>
            </div>
            <div className="flex gap-4 items-center">
              <div className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy', { locale: tr })}</div>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Link to="/dashboard"><Button variant="ghost">Pano</Button></Link>
            <Link to="/tasks"><Button variant="ghost">Görevler</Button></Link>
            <Link to="/calendar"><Button variant="secondary">Takvim</Button></Link>
            <Link to="/family"><Button variant="ghost">Aile</Button></Link>
            <Link to="/profile"><Button variant="ghost">Profil</Button></Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Görev Takvimi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map((day) => (
                <div key={day} className="text-center font-semibold p-2">
                  {day}
                </div>
              ))}
              
              {daysInMonth.map((day) => {
                const dayTasks = getTasksForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[100px] p-2 border rounded-lg ${
                      !isSameMonth(day, currentDate) ? 'opacity-50' : ''
                    } ${isToday ? 'border-primary border-2' : ''}`}
                  >
                    <div className="font-semibold text-sm mb-1">{format(day, 'd')}</div>
                    <div className="space-y-1">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded ${getPriorityColor(task.priority)} truncate`}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;