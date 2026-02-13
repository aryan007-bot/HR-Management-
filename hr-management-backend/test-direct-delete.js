const supabase = require('./src/config/supabase');

async function testDelete() {
  try {
    // 1. Create a test employee
    console.log('1. Creating test employee...');
    const randomAadhaar = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const { data: employee, error: createError } = await supabase
      .from('employees')
      .insert({
        company_id: 'b9134d23-129e-43da-b92b-effc47c945a0',
        employee_code: `TEST-2026-${Date.now()}`,
        full_name: 'Test Employee',
        phone: '1234567890',
        email: 'test@example.com',
        aadhaar_number: randomAadhaar,
        department: 'Engineering',
        designation: 'Software Engineer',
        status: 'ACTIVE',
        date_of_joining: '2026-02-10'
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Create error:', createError);
      return;
    }
    
    console.log('✓ Test employee created:', employee.id);
    
    // 2. Delete the employee
    console.log('\n2. Deleting employee...');
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .eq('id', employee.id);
    
    if (deleteError) {
      console.error('✗ Delete failed:', deleteError);
    } else {
      console.log('✓ Employee deleted successfully!');
    }
    
    // 3. Verify deletion
    console.log('\n3. Verifying deletion...');
    const { data: check } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employee.id)
      .single();
    
    if (!check) {
      console.log('✓ Confirmed: Employee no longer exists in database');
    } else {
      console.log('✗ Warning: Employee still exists');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
  process.exit();
}

testDelete();
