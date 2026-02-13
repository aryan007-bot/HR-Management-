const supabase = require('./src/config/supabase');

async function listUsersWithRoles() {
  const { data, error } = await supabase
    .from('users')
    .select('email, role');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Users and Roles:');
    data.forEach(user => {
      console.log(`${user.email}: ${user.role}`);
    });
  }
  process.exit();
}

listUsersWithRoles();
