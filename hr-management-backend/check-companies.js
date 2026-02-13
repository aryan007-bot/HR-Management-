
const supabase = require('./src/config/supabase');

async function getCompanies() {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name');
    
    if (error) {
      console.error('Error fetching companies:', error);
      return;
    }
    
    console.log('Available Companies:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

getCompanies();
