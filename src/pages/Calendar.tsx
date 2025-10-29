import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar as CalendarIcon, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Task, Profile } from '@/types';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  addWeeks,
  subWeeks,
  isToday,
  parseISO,
  getHours,
  startOfDay,
  endOfDay
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

// Time period definitions
type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

interface TimePeriodConfig {
  label: string;
  icon: any;
  hours: [number, number];
  gradient: string;
}

const TIME_PERIODS: Record<TimePeriod, TimePeriodConfig> = {
  morning: { label: 'Sabah', icon: Sunrise, hours: [6, 12], gradient: 'from-amber-50 to-orange-50' },
  afternoon: { label: 'Öğleden Sonra', icon: Sun, hours: [12, 18], gradient: 'from-sky-50 to-blue-50' },
  evening: { label: 'Akşam', icon: Sunset, hours: [18, 22], gradient: 'from-purple-50 to-pink-50' },
  night: { label: 'Gece', icon: Moon, hours: [22, 6], gradient: 'from-slate-50 to-indigo-50' },
};

const Calendar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.family_id) {
      loadTasks();
      loadFamilyMembers();

      // Realtime subscription
      const tasksChannel = supabase
        .channel('calendar-tasks')
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
  }, [profile, currentWeekStart]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    if (data) setProfile(data as Profile);
  };

  const loadFamilyMembers = async () => {
    if (!profile?.family_id) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('family_id', profile.family_id);
    
    if (data) {
      const profileMap: Record<string, Profile> = {};
      data.forEach((p: any) => {
        profileMap[p.id] = p as Profile;
      });
      setProfiles(profileMap);
    }
  };

  const loadTasks = async () => {
    if (!profile?.family_id) return;

    const start = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('family_id', profile.family_id)
      .gte('due_date', start.toISOString())
      .lte('due_date', end.toISOString())
      .order('due_date', { ascending: true });
    
    if (data) setTasks(data as Task[]);
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeekStart, { weekStartsOn: 1 }),
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
  });

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => task.due_date && isSameDay(parseISO(task.due_date), day));
  };

  const getTasksForPeriod = (day: Date, period: TimePeriod) => {
    const dayTasks = getTasksForDay(day);
    const [startHour, endHour] = TIME_PERIODS[period].hours;
    
    return dayTasks.filter(task => {
      if (!task.due_date) return false;
      const taskHour = getHours(parseISO(task.due_date));
      
      // Handle night period (crosses midnight)
      if (period === 'night') {
        return taskHour >= startHour || taskHour < endHour;
      }
      
      return taskHour >= startHour && taskHour < endHour;
    });
  };

  const getTaskCountForDay = (day: Date) => {
    return getTasksForDay(day).length;
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
    setSelectedDate(today);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 hover:bg-red-100';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100';
      case 'low': return 'border-l-green-500 bg-green-50 hover:bg-green-100';
      default: return 'border-l-gray-500 bg-gray-50 hover:bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <CalendarIcon className="h-8 w-8 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Takvim
                </h1>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: tr })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleToday}>
                Bugün
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
            <Link to="/calendar"><Button variant="secondary">Takvim</Button></Link>
            <Link to="/family"><Button variant="ghost">Aile</Button></Link>
            <Link to="/profile"><Button variant="ghost">Profil</Button></Link>
          </div>
        </div>

        {/* Week Navigation */}
        <Card className="border-2 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" onClick={handlePreviousWeek}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <motion.h2 
                key={currentWeekStart.toString()}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold"
              >
                {format(currentWeekStart, 'MMMM yyyy', { locale: tr })}
              </motion.h2>
              <Button variant="ghost" size="icon" onClick={handleNextWeek}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Week Days - Horizontal Scroll */}
            <div className="w-full overflow-x-auto overflow-y-hidden">
              <div className="flex gap-3 pb-2 min-w-max px-1">
                {weekDays.map((day, index) => {
                  const taskCount = getTaskCountForDay(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);
                  
                  return (
                    <motion.button
                      key={day.toString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        flex-shrink-0 w-20 p-4 rounded-2xl border-2 transition-all
                        ${isSelected 
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105' 
                          : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
                        }
                        ${isTodayDate && !isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                      `}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-medium opacity-70">
                          {format(day, 'EEE', { locale: tr })}
                        </span>
                        <span className="text-2xl font-bold">
                          {format(day, 'd')}
                        </span>
                        {/* Heat Map Dots */}
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(taskCount, 5) }).map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.05 + i * 0.05 }}
                              className={`
                                w-1.5 h-1.5 rounded-full
                                ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}
                                ${taskCount > 3 ? 'opacity-100' : taskCount > 1 ? 'opacity-60' : 'opacity-30'}
                              `}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate.toString()}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {(Object.keys(TIME_PERIODS) as TimePeriod[]).map((period, periodIndex) => {
              const periodTasks = getTasksForPeriod(selectedDate, period);
              const config = TIME_PERIODS[period];
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={period}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: periodIndex * 0.1 }}
                >
                  <Card className={`border-l-4 bg-gradient-to-r ${config.gradient}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-background rounded-lg shadow-sm">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{config.label}</h3>
                          <p className="text-xs text-muted-foreground">
                            {config.hours[0]}:00 - {config.hours[1]}:00
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-auto">
                          {periodTasks.length} görev
                        </Badge>
                      </div>

                      {periodTasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">Bu zaman diliminde görev yok</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {periodTasks.map((task, taskIndex) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: taskIndex * 0.05 }}
                              onClick={() => navigate(`/tasks/${task.id}`)}
                              className={`
                                p-4 rounded-xl border-l-4 cursor-pointer transition-all
                                ${getPriorityColor(task.priority)}
                                shadow-sm hover:shadow-md
                              `}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold truncate">{task.title}</h4>
                                    {task.status === 'completed' && (
                                      <Badge variant="default" className="bg-green-500">
                                        ✓ Tamamlandı
                                      </Badge>
                                    )}
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 flex-wrap">
                                    {/* Assigned Members */}
                                    {task.assigned_to.length > 0 && (
                                      <div className="flex -space-x-2">
                                        {task.assigned_to.slice(0, 3).map((userId) => (
                                          <Avatar key={userId} className="w-7 h-7 border-2 border-background">
                                            <AvatarImage src={profiles[userId]?.avatar_url || undefined} />
                                            <AvatarFallback className="text-xs">
                                              {profiles[userId]?.display_name?.[0] || '?'}
                                            </AvatarFallback>
                                          </Avatar>
                                        ))}
                                        {task.assigned_to.length > 3 && (
                                          <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                            <span className="text-xs font-medium">
                                              +{task.assigned_to.length - 3}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {/* Time */}
                                    {task.due_date && (
                                      <Badge variant="outline" className="gap-1">
                                        <Clock className="h-3 w-3" />
                                        {format(parseISO(task.due_date), 'HH:mm')}
                                      </Badge>
                                    )}
                                    {/* Points */}
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                      ⚡ {task.points} puan
                                    </Badge>
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
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Floating Action Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="fixed bottom-8 right-8"
        >
          <Button
            size="lg"
            className="rounded-full w-16 h-16 shadow-2xl hover:scale-110 transition-transform"
            onClick={() => navigate('/tasks/new')}
          >
            <Plus className="h-8 w-8" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Calendar;