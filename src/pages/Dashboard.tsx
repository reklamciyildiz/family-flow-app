import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, CheckCircle2, Clock, Plus, Trophy, Users } from 'lucide-react';
import type { Task, Profile } from '@/types';

const Dashboard = () => {
  // Mock data
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      family_id: '1',
      title: 'Take out the trash',
      description: null,
      due_date: new Date().toISOString(),
      repeat_type: 'daily',
      priority: 'high',
      status: 'pending',
      points: 15,
      assigned_to: ['user-1'],
      completed_by: null,
      completed_at: null,
      created_by: 'user-1',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      family_id: '1',
      title: 'Do homework',
      description: 'Math and English',
      due_date: new Date().toISOString(),
      repeat_type: 'daily',
      priority: 'medium',
      status: 'in_progress',
      points: 10,
      assigned_to: ['user-2'],
      completed_by: null,
      completed_at: null,
      created_by: 'user-1',
      created_at: new Date().toISOString(),
    },
  ]);

  const [familyMembers] = useState<Profile[]>([
    {
      id: 'user-1',
      family_id: '1',
      display_name: 'Mom',
      avatar_url: null,
      role: 'parent',
      points: 150,
      created_at: new Date().toISOString(),
    },
    {
      id: 'user-2',
      family_id: '1',
      display_name: 'Tommy',
      avatar_url: null,
      role: 'child',
      points: 120,
      created_at: new Date().toISOString(),
    },
  ]);

  const todayTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    const taskDate = new Date(task.due_date);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  });

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-accent text-accent-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Family Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
          </div>
          <Link to="/tasks/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayTasks.filter(t => t.status === 'completed').length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Family Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{familyMembers.length}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Today's Tasks */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
                <CardDescription>Tasks due today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground">No tasks due today</p>
                ) : (
                  todayTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        <span className="text-sm font-medium text-primary">{task.points} pts</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Family Leaderboard */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  Leaderboard
                </CardTitle>
                <CardDescription>This week's top performers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {familyMembers
                  .sort((a, b) => b.points - a.points)
                  .map((member, index) => (
                    <div key={member.id} className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold">
                        {index + 1}
                      </div>
                      <Avatar>
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback>{member.display_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.display_name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <span className="font-bold text-primary">{member.points}</span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
