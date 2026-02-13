const supabase = require('./src/config/supabase');
const bcrypt = require('bcryptjs');

async function seedSecondHR() {
  const companyId = 'b9134d23-129e-43da-b92b-effc47c945a0';
  const email = 'hr2@ons.com';
  const password = 'Password@123';
  const fullName = 'John Recruiter';

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!existingUser) {
      console.log('Creating second HR user...');
      const passwordHash = await bcrypt.hash(password, 10);
      await supabase.from('users').insert({
        email,
        password_hash: passwordHash,
        role: 'HR', // Strict HR role
        full_name: fullName,
        is_active: true,
        company_id: companyId
      });
      console.log('Second HR user created.');
    } else {
      console.log('Second HR user already exists.');
    }
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seedSecondHR();
