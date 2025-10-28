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
import { CalendarIcon, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { supabase } from '@/integrations/supabase/client';
import { Profile, TaskPriority, RepeatType } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';

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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Yeni Görev Oluştur</h1>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </Button>
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
            <CardTitle>Yeni Görev</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Görev başlığı"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Görev açıklaması"
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Son Tarih</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'PPP', { locale: tr }) : <span>Tarih seçin</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Öncelik</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Düşük</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tekrar</Label>
                  <Select value={repeatType} onValueChange={(v) => setRepeatType(v as RepeatType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Yok</SelectItem>
                      <SelectItem value="daily">Günlük</SelectItem>
                      <SelectItem value="weekly">Haftalık</SelectItem>
                      <SelectItem value="monthly">Aylık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Puan</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Atanan Kişiler</Label>
                <div className="space-y-2">
                  {familyMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={member.id}
                        checked={assignedTo.includes(member.id)}
                        onCheckedChange={() => toggleAssignment(member.id)}
                      />
                      <label
                        htmlFor={member.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {member.display_name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => navigate('/tasks')} className="flex-1">
                  İptal
                </Button>
                <Button type="submit" disabled={createTask.isPending} className="flex-1">
                  {createTask.isPending ? 'Oluşturuluyor...' : 'Görevi Oluştur'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskNew;