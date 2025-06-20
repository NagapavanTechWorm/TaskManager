import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks with filtering and pagination
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      project,
      assignedTo,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      filter.taskOwner = req.user._id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project;
    if (assignedTo) filter.taskOwner = assignedTo;

    // Date range filter
    if (startDate || endDate) {
      filter.plannedStartDate = {};
      if (startDate) filter.plannedStartDate.$gte = new Date(startDate);
      if (endDate) filter.plannedStartDate.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { taskName: { $regex: search, $options: 'i' } },
        { moduleName: { $regex: search, $options: 'i' } },
        { features: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const tasks = await Task.find(filter)
      .populate('project', 'name description')
      .populate('taskOwner', 'name email avatar')
      .populate('assignedBy', 'name email')
      .populate('dependencies.task', 'taskName slNo')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
});

// Get single task
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name description department')
      .populate('taskOwner', 'name email avatar department')
      .populate('assignedBy', 'name email')
      .populate('dependencies.task', 'taskName slNo status')
      .populate('comments.user', 'name avatar')
      .populate('timeEntries.user', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === 'employee' && task.taskOwner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
});

// Create new task (admin only)
router.post('/', authenticate, adminOnly, [
  body('project').isMongoId().withMessage('Valid project ID is required'),
  body('moduleName').trim().isLength({ min: 1 }).withMessage('Module name is required'),
  body('features').trim().isLength({ min: 1 }).withMessage('Features description is required'),
  body('taskName').trim().isLength({ min: 1 }).withMessage('Task name is required'),
  body('taskOwner').isMongoId().withMessage('Valid task owner ID is required'),
  body('plannedStartDate').isISO8601().withMessage('Valid planned start date is required'),
  body('plannedEndDate').isISO8601().withMessage('Valid planned end date is required'),
  body('plannedEffort').isNumeric().withMessage('Planned effort must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const taskData = {
      ...req.body,
      assignedBy: req.user._id
    };

    // Verify project exists
    const project = await Project.findById(taskData.project);
    if (!project) {
      return res.status(400).json({ message: 'Invalid project' });
    }

    // Verify task owner exists
    const taskOwner = await User.findById(taskData.taskOwner);
    if (!taskOwner) {
      return res.status(400).json({ message: 'Invalid task owner' });
    }

    const task = new Task(taskData);
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name description')
      .populate('taskOwner', 'name email avatar')
      .populate('assignedBy', 'name email');

    res.status(201).json({
      message: 'Task created successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
});

// Update task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    const canEdit = req.user.role === 'admin' || 
                   task.taskOwner.toString() === req.user._id.toString() ||
                   task.assignedBy.toString() === req.user._id.toString();

    if (!canEdit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Employees can only update certain fields
    let allowedFields = ['status', 'progress', 'actualEffort', 'description'];
    if (req.user.role === 'admin') {
      allowedFields = Object.keys(req.body);
    }

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('project', 'name description')
    .populate('taskOwner', 'name email avatar')
    .populate('assignedBy', 'name email');

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
});

// Add time entry
router.post('/:id/time', authenticate, [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('hours').isNumeric().isFloat({ min: 0.1, max: 24 }).withMessage('Hours must be between 0.1 and 24'),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user can log time for this task
    if (req.user.role === 'employee' && task.taskOwner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only log time for your own tasks' });
    }

    const timeEntry = {
      date: req.body.date,
      hours: req.body.hours,
      description: req.body.description,
      user: req.user._id
    };

    task.timeEntries.push(timeEntry);
    
    // Update actual effort
    task.actualEffort = task.timeEntries.reduce((total, entry) => total + entry.hours, 0);
    
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('timeEntries.user', 'name avatar');

    res.json({
      message: 'Time entry added successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Add time entry error:', error);
    res.status(500).json({ message: 'Server error while adding time entry' });
  }
});

// Add comment
router.post('/:id/comments', authenticate, [
  body('comment').trim().isLength({ min: 1 }).withMessage('Comment is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = {
      user: req.user._id,
      comment: req.body.comment
    };

    task.comments.push(comment);
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('comments.user', 'name avatar');

    res.json({
      message: 'Comment added successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
});

// Delete task (admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
});

// Get task statistics
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'employee') {
      filter.taskOwner = req.user._id;
    }

    const stats = await Task.aggregate([
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

    const result = stats[0] || {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      notStartedTasks: 0,
      totalPlannedEffort: 0,
      totalActualEffort: 0,
      averageProgress: 0
    };

    res.json({ stats: result });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ message: 'Server error while fetching task statistics' });
  }
});

export default router;