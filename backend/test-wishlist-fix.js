const mongoose = require('mongoose');
const Wishlist = require('./models/Wishlist');
const User = require('./models/User');

require('dotenv').config();

async function testWishlistFix() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dfashion';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find a test user
    const user = await User.findOne({ email: 'rajesh@example.com' });
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('👤 Found test user:', user.email);

    // Test the fixed findOrCreateForUser method
    console.log('\n🧪 Testing Wishlist.findOrCreateForUser with populate...');
    
    const wishlist = await Wishlist.findOrCreateForUser(user._id, true);
    
    console.log('✅ Wishlist found/created successfully!');
    console.log('📊 Wishlist details:');
    console.log('   - User ID:', wishlist.user);
    console.log('   - Total Items:', wishlist.items.length);
    console.log('   - Total Value:', wishlist.totalValue);
    console.log('   - Is Public:', wishlist.isPublic);
    
    if (wishlist.items.length > 0) {
      console.log('\n📦 Sample wishlist items:');
      wishlist.items.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.product?.name || 'Product name not populated'}`);
        console.log(`      - Price: ₹${item.price}`);
        console.log(`      - Size: ${item.size}`);
        console.log(`      - Color: ${item.color}`);
        console.log(`      - Added: ${item.addedAt.toLocaleDateString()}`);
      });
    } else {
      console.log('📦 Wishlist is empty');
    }

    console.log('\n🎉 Wishlist API should now work without 500 errors!');

  } catch (error) {
    console.error('❌ Error testing wishlist fix:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testWishlistFix();
