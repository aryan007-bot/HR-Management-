
const supabase = require('./src/config/supabase');
const bcrypt = require('bcryptjs');

const PASSWORDS = ['Password@123', 'Admin@001'];

async function checkPasswords() {
  const { data: users, error } = await supabase.from('users').select('email, password_hash');
  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('--- PASSWORD CHECK ---');
  for (const user of users) {
    for (const pass of PASSWORDS) {
      const match = await bcrypt.compare(pass, user.password_hash);
      if (match) {
        console.log(`Email: ${user.email} -> Password: ${pass} (MATCH)`);
      }
    }
  }
}

checkPasswords().then(() => process.exit());
