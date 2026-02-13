
const supabase = require('./src/config/supabase');

async function seedCompany() {
  try {
    const { data: existing } = await supabase
      .from('companies')
      .select('id, name')
      .eq('name', 'ONS Solution')
      .single();

    if (existing) {
      console.log('Company already exists:', existing);
      return;
    }

    const { data, error } = await supabase
      .from('companies')
      .insert({ name: 'ONS Solution' })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating company:', error);
      return;
    }
    
    console.log('Company created:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

seedCompany();
