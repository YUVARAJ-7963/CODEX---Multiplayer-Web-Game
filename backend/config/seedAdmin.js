const Admin = require('../models/Admin');

const seedDefaultAdmin = async () => {
  try {
    // Check if default admin exists
    const defaultAdmin = await Admin.findOne({ email: 'codex.7963@gmail.com' });
    
    if (!defaultAdmin) {
      // Create default super admin
      const admin = new Admin({
        username: 'codex',
        email: 'codex.7963@gmail.com',
        password: 'codex123', // This will be hashed by the pre-save middleware
        role: 'superadmin',
        isDefault: true
      });

      await admin.save();
      console.log('Default super admin created successfully');
    } else {
      console.log('Default super admin already exists');
    }
  } catch (error) {
    console.error('Error seeding default admin:', error);
    throw error;
  }
};

module.exports = seedDefaultAdmin; 