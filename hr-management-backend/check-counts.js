const supabase = require('./src/config/supabase');

async function checkCounts() {
  const tables = [
    'users',
    'visitors',
    'employees',
    'employee_documents',
    'interviews',
    'generated_letters',
    'letter_templates',
    'companies'
  ];

  console.log('--- Database Record Counts ---');
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`${table.padEnd(20)}: Error - ${error.message}`);
      } else {
        console.log(`${table.padEnd(20)}: ${count} records`);
      }
    } catch (err) {
      console.log(`${table.padEnd(20)}: Exception - ${err.message}`);
    }
  }
  process.exit();
}

checkCounts();
