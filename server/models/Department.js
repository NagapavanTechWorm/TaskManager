import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  budget: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Virtual for employee count
departmentSchema.virtual('employeeCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  count: true
});

departmentSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Department', departmentSchema);