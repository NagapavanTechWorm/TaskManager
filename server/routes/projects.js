import express from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Get all projects
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, department, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await Project.find(filter)
      .populate('department', 'name')
      .populate('projectManager', 'name email')
      .populate('taskCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(filter);

    res.json({
      projects,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error while fetching projects' });
  }
});

// Get single project
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('department', 'name description')
      .populate('projectManager', 'name email avatar')
      .populate('taskCount');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error while fetching project' });
  }
});

// Create new project (admin only)
router.post('/', authenticate, adminOnly, [
  body('name').trim().isLength({ min: 1 }).withMessage('Project name is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('department').isMongoId().withMessage('Valid department ID is required'),
  body('projectManager').isMongoId().withMessage('Valid project manager ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Verify department exists
    const department = await Department.findById(req.body.department);
    if (!department) {
      return res.status(400).json({ message: 'Invalid department' });
    }

    // Verify project manager exists
    const projectManager = await User.findById(req.body.projectManager);
    if (!projectManager) {
      return res.status(400).json({ message: 'Invalid project manager' });
    }

    const project = new Project(req.body);
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('department', 'name')
      .populate('projectManager', 'name email');

    res.status(201).json({
      message: 'Project created successfully',
      project: populatedProject
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error while creating project' });
  }
});

// Update project (admin only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('department', 'name')
    .populate('projectManager', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error while updating project' });
  }
});

// Delete project (admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error while deleting project' });
  }
});

export default router;