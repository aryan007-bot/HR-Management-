
const supabase = require('./src/config/supabase');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  const email = 'abc@gmail.com';
  const newPassword = 'Password@123';
  
  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('email', email)
      .select('id, email');
    
    if (error) {
      console.error('Error resetting password:', error);
      return;
    }
    
    if (data.length === 0) {
      console.log('User not found.');
      return;
    }
    
    console.log('Password reset successfully for:', data[0].email);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

resetPassword();
