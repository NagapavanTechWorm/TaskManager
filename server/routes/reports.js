import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Department from '../models/Department.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'employee') {
      filter.taskOwner = req.user._id;
    }

    // Task statistics
    const taskStats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          notStartedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'not-started'] }, 1, 0] }
          },
          totalPlannedEffort: { $sum: '$plannedEffort' },
          totalActualEffort: { $sum: '$actualEffort' },
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);

    // Monthly task completion trend
    const monthlyTrend = await Task.aggregate([
      { $match: { ...filter, status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$actualEndDate' },
            month: { $month: '$actualEndDate' }
          },
          count: { $sum: 1 },
          totalEffort: { $sum: '$actualEffort' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Priority distribution
    const priorityStats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Status distribution
    const statusStats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      taskStats: taskStats[0] || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        notStartedTasks: 0,
        totalPlannedEffort: 0,
        totalActualEffort: 0,
        averageProgress: 0
      },
      monthlyTrend,
      priorityStats,
      statusStats
    };

    // Add admin-specific stats
    if (req.user.role === 'admin') {
      const projectCount = await Project.countDocuments({ status: 'active' });
      const userCount = await User.countDocuments({ isActive: true });
      const departmentCount = await Department.countDocuments({ isActive: true });

      result.adminStats = {
        activeProjects: projectCount,
        totalUsers: userCount,
        totalDepartments: departmentCount
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics' });
  }
});

// Get employee performance report (admin only)
router.get('/employee-performance', authenticate, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, department, employeeId } = req.query;

    const matchFilter = {};
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
    }
    if (employeeId) matchFilter.taskOwner = employeeId;

    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'taskOwner',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $lookup: {
          from: 'departments',
          localField: 'employee.department',
          foreignField: '_id',
          as: 'employeeDepartment'
        }
      },
      { $unwind: '$employeeDepartment' }
    ];

    if (department) {
      pipeline.push({
        $match: { 'employeeDepartment._id': mongoose.Types.ObjectId(department) }
      });
    }

    pipeline.push({
      $group: {
        _id: '$taskOwner',
        employeeName: { $first: '$employee.name' },
        employeeEmail: { $first: '$employee.email' },
        department: { $first: '$employeeDepartment.name' },
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        inProgressTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        },
        totalPlannedEffort: { $sum: '$plannedEffort' },
        totalActualEffort: { $sum: '$actualEffort' },
        averageProgress: { $avg: '$progress' },
        onTimeCompletion: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'completed'] },
                  { $lte: ['$actualEndDate', '$plannedEndDate'] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    });

    pipeline.push({
      $addFields: {
        completionRate: {
          $cond: [
            { $eq: ['$totalTasks', 0] },
            0,
            { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }
          ]
        },
        efficiencyRate: {
          $cond: [
            { $eq: ['$totalPlannedEffort', 0] },
            0,
            { $multiply: [{ $divide: ['$totalPlannedEffort', '$totalActualEffort'] }, 100] }
          ]
        },
        onTimeRate: {
          $cond: [
            { $eq: ['$completedTasks', 0] },
            0,
            { $multiply: [{ $divide: ['$onTimeCompletion', '$completedTasks'] }, 100] }
          ]
        }
      }
    });

    pipeline.push({ $sort: { completionRate: -1 } });

    const performanceData = await Task.aggregate(pipeline);

    res.json({ performanceData });
  } catch (error) {
    console.error('Get employee performance error:', error);
    res.status(500).json({ message: 'Server error while fetching employee performance' });
  }
});

// Get project progress report (admin only)
router.get('/project-progress', authenticate, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    const matchFilter = {};
    if (startDate || endDate) {
      matchFilter.startDate = {};
      if (startDate) matchFilter.startDate.$gte = new Date(startDate);
      if (endDate) matchFilter.startDate.$lte = new Date(endDate);
    }
    if (department) matchFilter.department = department;

    const projectProgress = await Project.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'project',
          as: 'tasks'
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'departmentInfo'
        }
      },
      { $unwind: '$departmentInfo' },
      {
        $addFields: {
          totalTasks: { $size: '$tasks' },
          completedTasks: {
            $size: {
              $filter: {
                input: '$tasks',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          },
          inProgressTasks: {
            $size: {
              $filter: {
                input: '$tasks',
                cond: { $eq: ['$$this.status', 'in-progress'] }
              }
            }
          },
          totalPlannedEffort: {
            $sum: '$tasks.plannedEffort'
          },
          totalActualEffort: {
            $sum: '$tasks.actualEffort'
          }
        }
      },
      {
        $addFields: {
          completionPercentage: {
            $cond: [
              { $eq: ['$totalTasks', 0] },
              0,
              { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }
            ]
          },
          effortVariance: {
            $subtract: ['$totalActualEffort', '$totalPlannedEffort']
          }
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          status: 1,
          priority: 1,
          startDate: 1,
          endDate: 1,
          department: '$departmentInfo.name',
          totalTasks: 1,
          completedTasks: 1,
          inProgressTasks: 1,
          completionPercentage: 1,
          totalPlannedEffort: 1,
          totalActualEffort: 1,
          effortVariance: 1,
          progress: 1
        }
      },
      { $sort: { completionPercentage: -1 } }
    ]);

    res.json({ projectProgress });
  } catch (error) {
    console.error('Get project progress error:', error);
    res.status(500).json({ message: 'Server error while fetching project progress' });
  }
});

// Get time tracking report
router.get('/time-tracking', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    
    const filter = {};
    if (req.user.role === 'employee') {
      filter.taskOwner = req.user._id;
    } else if (employeeId) {
      filter.taskOwner = employeeId;
    }

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter['timeEntries.date'] = {};
      if (startDate) dateFilter['timeEntries.date'].$gte = new Date(startDate);
      if (endDate) dateFilter['timeEntries.date'].$lte = new Date(endDate);
    }

    const timeTrackingData = await Task.aggregate([
      { $match: filter },
      { $unwind: '$timeEntries' },
      { $match: dateFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'timeEntries.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },
      { $unwind: '$projectInfo' },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timeEntries.date' } },
            user: '$timeEntries.user',
            task: '$_id'
          },
          userName: { $first: '$user.name' },
          taskName: { $first: '$taskName' },
          projectName: { $first: '$projectInfo.name' },
          totalHours: { $sum: '$timeEntries.hours' },
          entries: {
            $push: {
              hours: '$timeEntries.hours',
              description: '$timeEntries.description'
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          date: { $first: '$_id.date' },
          totalDayHours: { $sum: '$totalHours' },
          userEntries: {
            $push: {
              userName: '$userName',
              taskName: '$taskName',
              projectName: '$projectName',
              hours: '$totalHours',
              entries: '$entries'
            }
          }
        }
      },
      { $sort: { date: -1 } }
    ]);

    res.json({ timeTrackingData });
  } catch (error) {
    console.error('Get time tracking error:', error);
    res.status(500).json({ message: 'Server error while fetching time tracking data' });
  }
});

export default router;