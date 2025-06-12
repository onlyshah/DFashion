const mongoose = require('mongoose');
const User = require('./models/User');

require('dotenv').config();

async function fixUserPassword() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dfashion';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'rajesh@example.com' });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 User found:', user.email);
    console.log('🔐 Current password hash:', user.password.substring(0, 20) + '...');

    // Fix the password by setting plain text - pre-save middleware will hash it
    console.log('\n🔧 Fixing password...');
    user.password = 'password123';
    await user.save();

    console.log('✅ Password updated successfully!');
    console.log('🔐 New password hash:', user.password.substring(0, 20) + '...');

    // Test the password
    console.log('\n🧪 Testing new password...');
    const isMatch = await user.comparePassword('password123');
    console.log('🔐 Password test result:', isMatch);

    if (isMatch) {
      console.log('🎉 SUCCESS! Password is now working correctly!');
      console.log('🔗 You can now login with:');
      console.log('   Email: rajesh@example.com');
      console.log('   Password: password123');
    } else {
      console.log('❌ Password still not working');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected');
  }
}

fixUserPassword();
