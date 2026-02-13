const employeeService = require('./src/services/employeeService');

async function testCreate() {
  const companyId = 'b9134d23-129e-43da-b92b-effc47c945a0'; // ONS Solution
  const data = {
    full_name: 'Test Employee ' + Date.now(),
    phone: '1234567890',
    aadhaar_number: '123456789' + (Math.floor(Math.random() * 900) + 100),
    email: 'test' + Date.now() + '@example.com',
    date_of_joining: '2026-01-01'
  };

  try {
    console.log('Testing employee creation...');
    const employee = await employeeService.createEmployee(data, companyId);
    console.log('Employee created:', employee.employee_code);
  } catch (err) {
    console.error('Error in test:', err.message);
  }
}

testCreate();
