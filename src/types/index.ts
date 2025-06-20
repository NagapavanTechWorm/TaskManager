export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department: string;
  avatar?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  headId: string;
  employeeCount: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: string;
  assignedBy: string;
  status: 'not-started' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  estimatedHours: number;
  actualHours: number;
}

export interface TaskLog {
  id: string;
  taskId: string;
  employeeId: string;
  date: string;
  hoursSpent: number;
  progress: number;
  notes: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalHours: number;
  efficiency: number;
}