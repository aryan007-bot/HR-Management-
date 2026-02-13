const supabase = require('./src/config/supabase');

async function cleanData() {
  console.log('Starting data cleanup...');
  
  try {
    // 1. Delete Interviews
    console.log('Deleting all interviews...');
    const { error: interviewError } = await supabase
      .from('interviews')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete not equal to dummy UUID (basically all)
    
    if (interviewError) console.error('Error deleting interviews:', interviewError);

    // 2. Delete Employees (Dependent on Visitors)
    console.log('Deleting all employees...');
    const { error: employeeError } = await supabase
      .from('employees')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (employeeError) console.error('Error deleting employees:', employeeError);

    // 3. Delete Visitors
    console.log('Deleting all visitors...');
    const { error: visitorError } = await supabase
      .from('visitors')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (visitorError) console.error('Error deleting visitors:', visitorError);

    // 4. Delete Users (HRs and Admin HRs, KEEP Super Admin)
    console.log('Deleting non-Super Admin users...');
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .neq('role', 'SUPER_ADMIN');

    if (userError) console.error('Error deleting users:', userError);

    console.log('Data cleanup completed successfully.');
  } catch (error) {
    console.error('Unexpected error during cleanup:', error);
  }
}

cleanData();
