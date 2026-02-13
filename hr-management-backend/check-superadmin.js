const supabase = require('./src/config/supabase');

async function checkSuperAdmin() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'SUPER_ADMIN');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Super Admin users:', data);
  }
  process.exit();
}

checkSuperAdmin();
