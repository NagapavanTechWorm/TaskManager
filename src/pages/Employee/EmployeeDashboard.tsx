import React from 'react';
import { Clock, CheckSquare, TrendingUp, AlertCircle } from 'lucide-react';
import StatsCard from '../../components/Dashboard/StatsCard';
import TaskCard from '../../components/Tasks/TaskCard';
import { mockTasks } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Filter tasks for current employee
  const myTasks = mockTasks.filter(task => task.assignedTo === user?.id);
  const completedTasks = myTasks.filter(task => task.status === 'completed');
  const inProgressTasks = myTasks.filter(task => task.status === 'in-progress');
  const totalHours = myTasks.reduce((sum, task) => sum + task.actualHours, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-1">Track your tasks and manage your daily work</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="My Tasks"
          value={myTasks.length}
          icon={CheckSquare}
          color="orange"
        />
        <StatsCard
          title="Completed"
          value={completedTasks.length}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="In Progress"
          value={inProgressTasks.length}
          icon={AlertCircle}
          color="blue"
        />
        <StatsCard
          title="Hours Logged"
          value={totalHours}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Today's Tasks */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Active Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myTasks.slice(0, 4).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Log Time</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Task
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>Choose a task...</option>
                {inProgressTasks.map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hours Spent
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.0"
              />
            </div>
            <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
              Log Time
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Tasks completed today</span>
              <span className="font-semibold text-green-600">2</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Hours logged today</span>
              <span className="font-semibold text-orange-600">6.5</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Efficiency score</span>
              <span className="font-semibold text-blue-600">85%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;