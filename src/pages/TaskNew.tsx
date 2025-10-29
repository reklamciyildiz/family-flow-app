import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, LogOut, Sparkles, AlertCircle, Clock, RefreshCw, Star, Users, ArrowLeft, Check } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { supabase } from '@/integrations/supabase/client';
import { Profile, TaskPriority, RepeatType } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const TaskNew = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { createTask } = useTaskMutations();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [familyMembers, setFamilyMembers] = useState<Profile[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [repeatType, setRepeatType] = useState<RepeatType>('none');
  const [points, setPoints] = useState(10);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.family_id) {
      loadFamilyMembers();
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

  const loadFamilyMembers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('family_id', profile!.family_id);
    if (data) setFamilyMembers(data as Profile[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.family_id) return;

    await createTask.mutateAsync({
      family_id: profile.family_id,
      title,
      description: description || null,
      due_date: dueDate?.toISOString() || null,
      priority,
      repeat_type: repeatType,
      points,
      assigned_to: assignedTo.length > 0 ? assignedTo : [user!.id],
      status: 'pending',
      created_by: user!.id,
    });

    navigate('/tasks');
  };

  const toggleAssignment = (memberId: string) => {
    setAssignedTo(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const getPriorityIcon = (p: TaskPriority) => {
    switch (p) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🌱';
    }
  };

  const getRepeatIcon = (r: RepeatType) => {
    switch (r) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      case 'none': return '⏱️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8 pb-24 md:pb-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Yeni Görev Oluştur
                </h1>
                <p className="text-sm text-muted-foreground">Aileniz için yeni bir görev tanımlayın</p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut} className="hidden md:flex">
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
          
          <div className="hidden md:flex gap-2 overflow-x-auto pb-2">
            <Link to="/dashboard"><Button variant="ghost">📊 Pano</Button></Link>
            <Link to="/tasks"><Button variant="ghost">✅ Görevler</Button></Link>
            <Link to="/calendar"><Button variant="ghost">📅 Takvim</Button></Link>
            <Link to="/family"><Button variant="ghost">👨‍👩‍👧‍👦 Aile</Button></Link>
            <Link to="/profile"><Button variant="ghost">👤 Profil</Button></Link>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="overflow-hidden border-2 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white pb-8">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Görev Detayları
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="space-y-3"
                >
                  <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2">
                    <span className="text-xl">📝</span>
                    Başlık *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Göreve bir başlık verin..."
                    required
                    className="h-12 text-lg border-2 focus:border-indigo-500 transition-all"
                  />
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="space-y-3"
                >
                  <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                    <span className="text-xl">📄</span>
                    Açıklama
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Görev hakkında detaylı açıklama yazın..."
                    rows={5}
                    className="text-base border-2 focus:border-indigo-500 transition-all resize-none"
                  />
                </motion.div>

                {/* Date & Priority */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="grid gap-6 md:grid-cols-2"
                >
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5 text-indigo-500" />
                      Son Tarih
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full h-12 justify-start text-left font-normal border-2 hover:border-indigo-500 transition-all"
                        >
                          <CalendarIcon className="mr-2 h-5 w-5 text-indigo-500" />
                          {dueDate ? format(dueDate, 'PPP', { locale: tr }) : <span className="text-muted-foreground">Tarih seçin</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      Öncelik
                    </Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                      <SelectTrigger className="h-12 border-2 hover:border-orange-500 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low" className="text-base">
                          <span className="flex items-center gap-2">🌱 Düşük</span>
                        </SelectItem>
                        <SelectItem value="medium" className="text-base">
                          <span className="flex items-center gap-2">⚡ Orta</span>
                        </SelectItem>
                        <SelectItem value="high" className="text-base">
                          <span className="flex items-center gap-2">🔥 Yüksek</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>

                {/* Repeat & Points */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="grid gap-6 md:grid-cols-2"
                >
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-blue-500" />
                      Tekrar
                    </Label>
                    <Select value={repeatType} onValueChange={(v) => setRepeatType(v as RepeatType)}>
                      <SelectTrigger className="h-12 border-2 hover:border-blue-500 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-base">
                          <span className="flex items-center gap-2">⏱️ Yok</span>
                        </SelectItem>
                        <SelectItem value="daily" className="text-base">
                          <span className="flex items-center gap-2">📅 Günlük</span>
                        </SelectItem>
                        <SelectItem value="weekly" className="text-base">
                          <span className="flex items-center gap-2">📆 Haftalık</span>
                        </SelectItem>
                        <SelectItem value="monthly" className="text-base">
                          <span className="flex items-center gap-2">🗓️ Aylık</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="points" className="text-base font-semibold flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Puan
                    </Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      max="100"
                      value={points}
                      onChange={(e) => setPoints(parseInt(e.target.value))}
                      className="h-12 text-lg border-2 focus:border-yellow-500 transition-all"
                    />
                  </div>
                </motion.div>

                {/* Assigned Members */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  className="space-y-4"
                >
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    Atanan Kişiler
                  </Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {familyMembers.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: 0.8 + index * 0.1 }}
                      >
                        <label
                          htmlFor={member.id}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                            assignedTo.includes(member.id)
                              ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <Checkbox
                            id={member.id}
                            checked={assignedTo.includes(member.id)}
                            onCheckedChange={() => toggleAssignment(member.id)}
                            className="h-5 w-5"
                          />
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                              {member.display_name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">{member.display_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {member.role === 'parent' ? '👨‍👩‍👧 Ebeveyn' : '👶 Çocuk'}
                            </p>
                          </div>
                          {assignedTo.includes(member.id) && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <Check className="h-5 w-5 text-purple-500" />
                            </motion.div>
                          )}
                        </label>
                      </motion.div>
                    ))}
                  </div>
                  {familyMembers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aile üyesi bulunamadı</p>
                    </div>
                  )}
                </motion.div>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                  className="flex gap-4 pt-4"
                >
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/tasks')} 
                    className="flex-1 h-12 text-base border-2 hover:bg-gray-50"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    İptal
                  </Button>
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      disabled={createTask.isPending} 
                      className="w-full h-12 text-base bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg"
                    >
                      {createTask.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                          Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Görevi Oluştur
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TaskNew;