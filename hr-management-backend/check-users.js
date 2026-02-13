
const supabase = require('./src/config/supabase');

async function checkUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, is_active');
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    
    data.forEach(u => console.log('Email:', u.email));
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkUsers();
