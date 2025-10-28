export type UserRole = 'parent' | 'child' | 'other';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly';

export type BadgeType = 'first_task' | 'week_star' | 'super_team' | 'consistent';

export type ActionType = 'task_created' | 'task_completed' | 'badge_earned';

export interface Family {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface Profile {
  id: string;
  family_id: string | null;
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
  points: number;
  created_at: string;
}

export interface Task {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  repeat_type: RepeatType;
  priority: TaskPriority;
  status: TaskStatus;
  points: number;
  assigned_to: string[];
  completed_by: string | null;
  completed_at: string | null;
  created_by: string;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  earned_at: string;
}

export interface Activity {
  id: string;
  family_id: string;
  user_id: string;
  action: ActionType;
  task_id: string | null;
  created_at: string;
}
