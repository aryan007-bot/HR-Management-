const supabase = require('./src/config/supabase');
const bcrypt = require('bcryptjs');

async function seedHR() {
  console.log('Seeding HR user...');
  const companyId = 'b9134d23-129e-43da-b92b-effc47c945a0';
  const email = 'hr@ons.com';
  const password = 'Password@123';
  const fullName = 'Sarah HR Manager';

  try {
    // 1. Ensure Company Exists
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .single();

    if (!company) {
      console.log('Creating default company...');
      await supabase.from('companies').insert({
        id: companyId,
        name: 'ONS Solution'
      });
    }

    // 2. Check if HR user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('HR user already exists. Updating...');
      await supabase.from('users').update({
        role: 'HR',
        full_name: fullName,
        is_active: true,
        company_id: companyId
      }).eq('id', existingUser.id);
    } else {
      console.log('Creating new HR user...');
      const passwordHash = await bcrypt.hash(password, 10);
      await supabase.from('users').insert({
        email,
        password_hash: passwordHash,
        role: 'HR',
        full_name: fullName,
        is_active: true,
        company_id: companyId
      });
    }
    console.log('HR user seeded successfully: ', email);
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seedHR();
