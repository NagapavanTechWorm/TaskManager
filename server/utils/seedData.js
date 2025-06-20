import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create Departments
    const departments = await Department.create([
      {
        name: 'Development',
        description: 'Software development and engineering',
        location: 'Building A, Floor 3'
      },
      {
        name: 'Design',
        description: 'UI/UX and graphic design',
        location: 'Building A, Floor 2'
      },
      {
        name: 'Marketing',
        description: 'Digital marketing and campaigns',
        location: 'Building B, Floor 1'
      },
      {
        name: 'Quality Assurance',
        description: 'Software testing and quality control',
        location: 'Building A, Floor 3'
      }
    ]);

    console.log('✅ Created departments');

    // Create Users
    const users = await User.create([
      {
        name: 'John Admin',
        email: 'admin@company.com',
        password: 'password',
        role: 'admin',
        department: departments[0]._id,
        employeeId: 'EMP001'
      },
      {
        name: 'Sarah Developer',
        email: 'sarah@company.com',
        password: 'password',
        role: 'employee',
        department: departments[0]._id,
        employeeId: 'EMP002'
      },
      {
        name: 'Mike Designer',
        email: 'mike@company.com',
        password: 'password',
        role: 'employee',
        department: departments[1]._id,
        employeeId: 'EMP003'
      },
      {
        name: 'Lisa Tester',
        email: 'lisa@company.com',
        password: 'password',
        role: 'employee',
        department: departments[3]._id,
        employeeId: 'EMP004'
      },
      {
        name: 'David Manager',
        email: 'david@company.com',
        password: 'password',
        role: 'admin',
        department: departments[0]._id,
        employeeId: 'EMP005'
      }
    ]);

    console.log('✅ Created users');

    // Update department heads
    await Department.findByIdAndUpdate(departments[0]._id, { head: users[0]._id });
    await Department.findByIdAndUpdate(departments[1]._id, { head: users[2]._id });
    await Department.findByIdAndUpdate(departments[2]._id, { head: users[0]._id });
    await Department.findByIdAndUpdate(departments[3]._id, { head: users[3]._id });

    // Create Projects
    const projects = await Project.create([
      {
        name: 'Task Manager Application',
        description: 'Building a comprehensive task management system with MERN stack',
        department: departments[0]._id,
        projectManager: users[0]._id,
        status: 'active',
        priority: 'high',
        startDate: new Date('2024-01-01'),
        plannedEndDate: new Date('2024-06-30'),
        budget: 50000
      },
      {
        name: 'Company Website Redesign',
        description: 'Complete redesign of company website with modern UI/UX',
        department: departments[1]._id,
        projectManager: users[2]._id,
        status: 'active',
        priority: 'medium',
        startDate: new Date('2024-02-01'),
        plannedEndDate: new Date('2024-05-31'),
        budget: 30000
      },
      {
        name: 'Mobile App Development',
        description: 'Developing mobile application for task management',
        department: departments[0]._id,
        projectManager: users[4]._id,
        status: 'planning',
        priority: 'high',
        startDate: new Date('2024-03-01'),
        plannedEndDate: new Date('2024-09-30'),
        budget: 75000
      }
    ]);

    console.log('✅ Created projects');

    // Create Tasks
    const tasks = await Task.create([
      {
        project: projects[0]._id,
        moduleName: 'Authentication System',
        features: 'User login, registration, JWT authentication, role-based access control',
        taskName: 'Implement User Authentication',
        deliverables: [
          { name: 'Login API', link: 'https://github.com/project/auth-api', type: 'code' },
          { name: 'Auth Documentation', link: 'https://docs.project.com/auth', type: 'document' }
        ],
        plannedStartDate: new Date('2024-01-05'),
        actualStartDate: new Date('2024-01-05'),
        plannedEndDate: new Date('2024-01-20'),
        taskOwner: users[1]._id,
        assignedBy: users[0]._id,
        plannedEffort: 40,
        actualEffort: 35,
        status: 'completed',
        priority: 'high',
        progress: 100,
        description: 'Complete authentication system with JWT tokens and role-based access'
      },
      {
        project: projects[0]._id,
        moduleName: 'Task Management',
        features: 'CRUD operations for tasks, task assignment, status tracking, progress monitoring',
        taskName: 'Build Task Management Module',
        deliverables: [
          { name: 'Task API', link: 'https://github.com/project/task-api', type: 'code' },
          { name: 'Task UI Components', link: 'https://github.com/project/task-ui', type: 'code' }
        ],
        plannedStartDate: new Date('2024-01-21'),
        actualStartDate: new Date('2024-01-22'),
        plannedEndDate: new Date('2024-02-15'),
        taskOwner: users[1]._id,
        assignedBy: users[0]._id,
        plannedEffort: 60,
        actualEffort: 45,
        status: 'in-progress',
        priority: 'high',
        progress: 75,
        description: 'Complete task management functionality with all CRUD operations'
      },
      {
        project: projects[0]._id,
        moduleName: 'Dashboard & Analytics',
        features: 'Admin dashboard, employee dashboard, charts, reports, statistics',
        taskName: 'Create Dashboard Interface',
        deliverables: [
          { name: 'Dashboard Components', link: 'https://github.com/project/dashboard', type: 'code' },
          { name: 'Analytics API', link: 'https://github.com/project/analytics', type: 'code' }
        ],
        plannedStartDate: new Date('2024-02-16'),
        plannedEndDate: new Date('2024-03-10'),
        taskOwner: users[1]._id,
        assignedBy: users[0]._id,
        plannedEffort: 50,
        actualEffort: 0,
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        description: 'Build comprehensive dashboard with analytics and reporting features'
      },
      {
        project: projects[1]._id,
        moduleName: 'UI/UX Design',
        features: 'Modern design system, responsive layouts, user experience optimization',
        taskName: 'Design Website Mockups',
        deliverables: [
          { name: 'Design System', link: 'https://figma.com/design-system', type: 'design' },
          { name: 'Website Mockups', link: 'https://figma.com/website-mockups', type: 'design' }
        ],
        plannedStartDate: new Date('2024-02-01'),
        actualStartDate: new Date('2024-02-01'),
        plannedEndDate: new Date('2024-02-20'),
        taskOwner: users[2]._id,
        assignedBy: users[0]._id,
        plannedEffort: 30,
        actualEffort: 28,
        status: 'completed',
        priority: 'high',
        progress: 100,
        description: 'Create comprehensive design system and website mockups'
      },
      {
        project: projects[1]._id,
        moduleName: 'Frontend Development',
        features: 'Responsive web pages, interactive components, performance optimization',
        taskName: 'Implement Website Frontend',
        deliverables: [
          { name: 'Website Code', link: 'https://github.com/project/website', type: 'code' },
          { name: 'Performance Report', link: 'https://docs.project.com/performance', type: 'document' }
        ],
        plannedStartDate: new Date('2024-02-21'),
        actualStartDate: new Date('2024-02-23'),
        plannedEndDate: new Date('2024-03-20'),
        taskOwner: users[1]._id,
        assignedBy: users[0]._id,
        plannedEffort: 45,
        actualEffort: 30,
        status: 'in-progress',
        priority: 'medium',
        progress: 60,
        description: 'Implement responsive frontend based on approved designs'
      }
    ]);

    // Add some time entries
    tasks[0].timeEntries = [
      {
        date: new Date('2024-01-05'),
        hours: 8,
        description: 'Set up authentication structure and JWT implementation',
        user: users[1]._id
      },
      {
        date: new Date('2024-01-08'),
        hours: 7,
        description: 'Implemented role-based access control',
        user: users[1]._id
      },
      {
        date: new Date('2024-01-12'),
        hours: 8,
        description: 'Testing and bug fixes for authentication',
        user: users[1]._id
      }
    ];

    tasks[1].timeEntries = [
      {
        date: new Date('2024-01-22'),
        hours: 8,
        description: 'Created task model and basic CRUD operations',
        user: users[1]._id
      },
      {
        date: new Date('2024-01-25'),
        hours: 7.5,
        description: 'Implemented task assignment and status tracking',
        user: users[1]._id
      }
    ];

    await Promise.all(tasks.map(task => task.save()));

    console.log('✅ Created tasks with time entries');
    console.log('🎉 Database seeded successfully!');
    
    console.log('\n📋 Demo Credentials:');
    console.log('Admin: admin@company.com / password');
    console.log('Employee: sarah@company.com / password');
    console.log('Employee: mike@company.com / password');
    console.log('Employee: lisa@company.com / password');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

export default seedDatabase;