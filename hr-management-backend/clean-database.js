const supabase = require('./src/config/supabase');

async function cleanDatabase() {
  console.log(' Starting database cleanup...');

  try {
    // 1. Delete Letters
    console.log('Deleting generated letters...');
    const { error: letterError } = await supabase.from('generated_letters').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (letterError) console.error('Letter delete error:', letterError.message);

    // 2. Delete Documents
    console.log('Deleting employee documents...');
    const { error: docError } = await supabase.from('employee_documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (docError) console.error('Doc delete error:', docError.message);

    // 3. Delete Interviews
    console.log('Deleting interviews...');
    const { error: intError } = await supabase.from('interviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (intError) console.error('Interview delete error:', intError.message);

    // 4. Delete Employees
    console.log('Deleting employees...');
    const { error: empError } = await supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (empError) console.error('Employee delete error:', empError.message);

    // 5. Delete Visitors
    console.log('Deleting visitors...');
    const { error: visError } = await supabase.from('visitors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (visError) console.error('Visitor delete error:', visError.message);

    // 6. Delete HR Users (keep Super Admin)
    console.log('Deleting HR and Admin HR users...');
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .neq('role', 'SUPER_ADMIN');
    if (userError) console.error('User delete error:', userError.message);

    console.log('✅ Cleanup complete! Database is now empty (except for SUPER_ADMIN and Companies).');
  } catch (err) {
    console.error('❌ Unexpected cleanup error:', err);
  } finally {
    process.exit();
  }
}

cleanDatabase();
