
const supabase = require('./src/config/supabase');

async function check() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Users:');
    data.forEach(user => {
      console.log(`- Email: ${user.email}, Role: ${user.role}, Active: ${user.is_active}, CompanyID: ${user.company_id}`);
    });
  }
}

check().then(() => process.exit());
