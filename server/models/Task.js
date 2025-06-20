import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  slNo: {
    type: Number,
    unique: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  moduleName: {
    type: String,
    required: [true, 'Module name is required'],
    trim: true,
    maxlength: [200, 'Module name cannot exceed 200 characters']
  },
  features: {
    type: String,
    required: [true, 'Features description is required'],
    trim: true,
    maxlength: [1000, 'Features cannot exceed 1000 characters']
  },
  taskName: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
    maxlength: [200, 'Task name cannot exceed 200 characters']
  },
  deliverables: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    link: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['document', 'code', 'design', 'test', 'other'],
      default: 'other'
    }
  }],
  plannedStartDate: {
    type: Date,
    required: [true, 'Planned start date is required']
  },
  actualStartDate: {
    type: Date
  },
  plannedEndDate: {
    type: Date,
    required: [true, 'Planned end date is required']
  },
  actualEndDate: {
    type: Date
  },
  taskOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task owner is required']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned by is required']
  },
  plannedEffort: {
    type: Number,
    required: [true, 'Planned effort is required'],
    min: [0, 'Planned effort cannot be negative']
  },
  actualEffort: {
    type: Number,
    default: 0,
    min: [0, 'Actual effort cannot be negative']
  },
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish'],
      default: 'finish-to-start'
    },
    description: String
  }],
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'on-hold', 'cancelled'],
    default: 'not-started'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  timeEntries: [{
    date: {
      type: Date,
      required: true
    },
    hours: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }]
}, {
  timestamps: true
});

// Auto-increment slNo
taskSchema.pre('save', async function(next) {
  if (this.isNew && !this.slNo) {
    try {
      const lastTask = await this.constructor.findOne({}, {}, { sort: { slNo: -1 } });
      this.slNo = lastTask ? lastTask.slNo + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Update actualStartDate when status changes to in-progress
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'in-progress' && !this.actualStartDate) {
    this.actualStartDate = new Date();
  }
  
  if (this.isModified('status') && this.status === 'completed' && !this.actualEndDate) {
    this.actualEndDate = new Date();
    this.progress = 100;
  }
  
  next();
});

export default mongoose.model('Task', taskSchema);