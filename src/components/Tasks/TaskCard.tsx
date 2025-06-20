import React from 'react';
import { Clock, User, Calendar, AlertCircle } from 'lucide-react';
import { Task } from '../../types';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  showAssignee?: boolean;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, showAssignee = false, onClick }) => {
  const statusColors = {
    'not-started': 'bg-gray-100 text-gray-800 border-gray-200',
    'in-progress': 'bg-orange-100 text-orange-800 border-orange-200',
    'completed': 'bg-green-100 text-green-800 border-green-200',
  };

  const priorityColors = {
    low: 'text-green-600',
    medium: 'text-orange-600',
    high: 'text-red-600',
  };

  const progress = task.status === 'completed' ? 100 : task.status === 'in-progress' ? 60 : 0;

  return (
    <div 
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <AlertCircle className={`w-4 h-4 ${priorityColors[task.priority]}`} />
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[task.status]}`}>
            {task.status.replace('-', ' ')}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Due: {format(new Date(task.dueDate), 'MMM dd')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{task.actualHours}h / {task.estimatedHours}h</span>
            </div>
          </div>
          {showAssignee && (
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>Assigned</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;