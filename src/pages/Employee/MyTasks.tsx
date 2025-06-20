import React, { useState } from 'react';
import { Clock, CheckSquare, AlertTriangle, Plus } from 'lucide-react';
import TaskCard from '../../components/Tasks/TaskCard';
import { mockTasks, mockTaskLogs } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

const MyTasks: React.FC = () => {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [hoursToLog, setHoursToLog] = useState('');
  const [progressUpdate, setProgressUpdate] = useState('');
  const [notes, setNotes] = useState('');

  // Filter tasks for current employee
  const myTasks = mockTasks.filter(task => task.assignedTo === user?.id);
  const activeTasks = myTasks.filter(task => task.status !== 'completed');
  const completedTasks = myTasks.filter(task => task.status === 'completed');

  const handleTimeLog = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle time logging logic here
    console.log('Logging time:', { selectedTask, hoursToLog, progressUpdate, notes });
    
    // Reset form
    setSelectedTask(null);
    setHoursToLog('');
    setProgressUpdate('');
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600 mt-1">Manage your assigned tasks and log your progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckSquare className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{activeTasks.length}</div>
              <div className="text-sm text-gray-600">Active Tasks</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{completedTasks.length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {myTasks.reduce((sum, task) => sum + task.actualHours, 0)}
              </div>
              <div className="text-sm text-gray-600">Hours Logged</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Tasks</h2>
            <div className="space-y-4">
              {activeTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Tasks</h2>
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        </div>

        {/* Time Logging Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Time</h3>
            <form onSubmit={handleTimeLog} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Task
                </label>
                <select
                  value={selectedTask || ''}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a task...</option>
                  {activeTasks.map(task => (
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
                  value={hoursToLog}
                  onChange={(e) => setHoursToLog(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0.0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Update (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progressUpdate}
                  onChange={(e) => setProgressUpdate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="What did you work on today?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Log Time</span>
              </button>
            </form>
          </div>

          {/* Today's Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h3>
            <div className="space-y-3">
              {mockTaskLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-gray-900">Task Progress</span>
                    <span className="text-xs text-gray-500">{log.hoursSpent}h</span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{log.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;