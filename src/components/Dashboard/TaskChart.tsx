import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const taskStatusData = [
  { name: 'Completed', value: 45, color: '#22C55E' },
  { name: 'In Progress', value: 35, color: '#FF6B35' },
  { name: 'Not Started', value: 20, color: '#94A3B8' },
];

const monthlyData = [
  { month: 'Jan', completed: 12, inProgress: 8, notStarted: 5 },
  { month: 'Feb', completed: 15, inProgress: 12, notStarted: 3 },
  { month: 'Mar', completed: 18, inProgress: 15, notStarted: 7 },
  { month: 'Apr', completed: 22, inProgress: 18, notStarted: 4 },
  { month: 'May', completed: 25, inProgress: 20, notStarted: 6 },
  { month: 'Jun', completed: 28, inProgress: 22, notStarted: 8 },
];

const TaskChart: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Task Status Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={taskStatusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {taskStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completed" fill="#22C55E" name="Completed" />
            <Bar dataKey="inProgress" fill="#FF6B35" name="In Progress" />
            <Bar dataKey="notStarted" fill="#94A3B8" name="Not Started" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TaskChart;