const apiUrl = 'http://localhost:5000/api';

// Test login and delete
async function testDeleteEmployee() {
  try {
    // 1. Login first
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@system.com',
        password: 'SuperAdmin@123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.error('Login failed:', loginData);
      return;
    }
    
    const token = loginData.data.token;
    console.log('✓ Login successful');
    
    // 2. Get all employees
    console.log('\n2. Fetching employees...');
    const employeesResponse = await fetch(`${apiUrl}/employees`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const employeesData = await employeesResponse.json();
    console.log(`✓ Found ${employeesData.data?.length || 0} employees`);
    
    if (!employeesData.data || employeesData.data.length === 0) {
      console.log('No employees to delete');
      return;
    }
    
    const testEmployeeId = employeesData.data[0].id;
    console.log(`\n3. Testing DELETE on employee: ${testEmployeeId}`);
    
    // 3. Test DELETE endpoint
    const deleteResponse = await fetch(`${apiUrl}/employees/${testEmployeeId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const deleteData = await deleteResponse.json();
    console.log('Delete response status:', deleteResponse.status);
    console.log('Delete response:', deleteData);
    
    if (deleteResponse.ok) {
      console.log('✓ DELETE endpoint working correctly!');
    } else {
      console.error('✗ DELETE endpoint failed:', deleteData);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDeleteEmployee();
