
const supabase = require('./src/config/supabase');
const fs = require('fs');

async function check() {
  try {
    const { data, error } = await supabase.from('users').select('id, email, role, full_name, is_active');
    if (error) {
      fs.writeFileSync('users_output.json', JSON.stringify(error, null, 2));
    } else {
      fs.writeFileSync('users_output.json', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    fs.writeFileSync('users_output.json', JSON.stringify({ catchError: err.message }, null, 2));
  }
}

check().then(() => process.exit());
