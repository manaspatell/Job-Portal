/**
 * Password Migration Script
 * Hashes all existing plain text passwords in the database
 * Run once: node migrate-passwords.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const School = require('./models/School');

async function migratePasswords() {
  try {
    console.log('🔒 Starting password migration...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recruitment_db');
    console.log('✓ Connected to MongoDB');
    
    // Find all schools
    const schools = await School.find({});
    console.log(`Found ${schools.length} schools to migrate`);
    
    if (schools.length === 0) {
      console.log('✓ No schools found. Migration complete.');
      await mongoose.connection.close();
      return;
    }
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    // Process each school
    for (const school of schools) {
      try {
        // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
        if (school.password.startsWith('$2a$') || school.password.startsWith('$2b$') || school.password.startsWith('$2y$')) {
          console.log(`⏭️  ${school.email} - Already hashed, skipping`);
          skippedCount++;
          continue;
        }
        
        // Hash the plain text password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(school.password, saltRounds);
        
        // Update the password without triggering the pre-save hook
        await School.updateOne(
          { _id: school._id },
          { password: hashedPassword }
        );
        
        console.log(`✓ ${school.email} - Password hashed successfully`);
        migratedCount++;
      } catch (error) {
        console.error(`✗ ${school.email} - Migration failed: ${error.message}`);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✓ Migrated: ${migratedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`📈 Total: ${schools.length}`);
    
    await mongoose.connection.close();
    console.log('\n✓ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migratePasswords();
