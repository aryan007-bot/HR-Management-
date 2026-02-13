
const supabase = require('./src/config/supabase');

async function checkEmails() {
  const { data, error } = await supabase.from('users').select('email');
  if (error) {
    console.error(error);
    return;
  }
  data.forEach(u => console.log(`[${u.email}]`));
}

checkEmails().then(() => process.exit());
