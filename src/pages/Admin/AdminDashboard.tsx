import React from 'react';
import { Users, CheckSquare, Clock, TrendingUp, Plus } from 'lucide-react';
import StatsCard from '../../components/Dashboard/StatsCard';
import TaskChart from '../../components/Dashboard/TaskChart';
import TaskCard from '../../components/Tasks/TaskCard';
import { mockTasks, mockDashboardStats } from '../../data/mockData';

const AdminDashboard: React.FC = () => {
  const recentTasks = mockTasks.slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor team performance and manage tasks</p>
        </div>
        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-600 transition-colors">
          <Plus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Tasks"
          value={mockDashboardStats.totalTasks}
          icon={CheckSquare}
          trend={{ value: 12, isPositive: true }}
          color="orange"
        />
        <StatsCard
          title="Completed Tasks"
          value={mockDashboardStats.completedTasks}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Active Users"
          value={15}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Total Hours"
          value={mockDashboardStats.totalHours}
          icon={Clock}
          trend={{ value: 15, isPositive: true }}
          color="purple"
        />
      </div>

      {/* Charts */}
      <TaskChart />

      {/* Recent Tasks */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
          <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentTasks.map((task) => (
            <TaskCard key={task.id} task={task} showAssignee />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;