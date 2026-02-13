
const supabase = require('./src/config/supabase');

async function check() {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('USERS_START');
      console.log(JSON.stringify(data, null, 2));
      console.log('USERS_END');
    }
  } catch (err) {
    console.error('Catch Error:', err);
  }
}

check();
