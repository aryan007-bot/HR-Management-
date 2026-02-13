const visitorService = require('./src/services/visitorService');

async function testGetHosts() {
  try {
    const companyId = 'b9134d23-129e-43da-b92b-effc47c945a0'; // Default ID
    console.log(`Fetching hosts for company ${companyId}...`);
    const hosts = await visitorService.getHosts(companyId);
    console.log('Hosts:', JSON.stringify(hosts, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

testGetHosts();
