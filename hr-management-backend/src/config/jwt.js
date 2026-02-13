const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}


module.exports = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // JWT payload structure
  generatePayload: (user) => ({
    id: user.id,
    email: user.email,
    role: user.role,
    companyId: user.company_id,
    fullName: user.full_name
  })
};
