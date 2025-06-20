import express from 'express';
import { body, validationResult } from 'express-validator';
import Department from '../models/Department.js';
import User from '../models/User.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Get all departments
router.get('/', authenticate, async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('head', 'name email')
      .populate('employeeCount')
      .sort({ name: 1 });

    res.json({ departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error while fetching departments' });
  }
});

// Get single department
router.get('/:id', authenticate, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'name email avatar')
      .populate('employeeCount');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Get department employees
    const employees = await User.find({ 
      department: req.params.id, 
      isActive: true 
    }).select('name email avatar role');

    res.json({ 
      department: {
        ...department.toJSON(),
        employees
      }
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error while fetching department' });
  }
});

// Create new department (admin only)
router.post('/', authenticate, adminOnly, [
  body('name').trim().isLength({ min: 1 }).withMessage('Department name is required'),
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

    // Check if department name already exists
    const existingDept = await Department.findOne({ 
      name: req.body.name,
      isActive: true 
    });
    
    if (existingDept) {
      return res.status(400).json({ message: 'Department name already exists' });
    }

    const department = new Department(req.body);
    await department.save();

    const populatedDepartment = await Department.findById(department._id)
      .populate('head', 'name email');

    res.status(201).json({
      message: 'Department created successfully',
      department: populatedDepartment
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error while creating department' });
  }
});

// Update department (admin only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('head', 'name email');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error while updating department' });
  }
});

// Delete department (admin only) - soft delete
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if department has employees
    const employeeCount = await User.countDocuments({ 
      department: req.params.id, 
      isActive: true 
    });
    
    if (employeeCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete department with active employees' 
      });
    }

    department.isActive = false;
    await department.save();

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error while deleting department' });
  }
});

export default router;