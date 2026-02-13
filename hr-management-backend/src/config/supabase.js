const { createClient } = require("@supabase/supabase-js");
const fs = require('fs');
const path = require('path'); // Added missing path import
const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
} else {
  require("dotenv").config();
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error("Environment Check:", {
    hasUrl: !!supabaseUrl,
    hasServiceRole: !!supabaseServiceRole,
    cwd: process.cwd(),
    envPath: path.resolve(__dirname, "../../.env"),
  });
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
