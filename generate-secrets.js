#!/usr/bin/env node

/**
 * Generate secure secrets for Vercel deployment
 * Usage: node generate-secrets.js
 */

const crypto = require('crypto');
const fs = require('fs');

console.log('\n🔐 AI Growth OS - Secret Generation Tool\n');
console.log('=' .repeat(50));

// ============ Helper Functions ============
function generateBase64Secret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function generateHex(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// For TOTP, we need base32 (not base64)
function generateBase32Secret(length = 32) {
  const buffer = crypto.randomBytes(length);
  const base32alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let base32 = '';
  
  let bits = 0;
  let value = 0;
  
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    
    while (bits >= 5) {
      bits -= 5;
      base32 += base32alphabet[(value >> bits) & 31];
    }
  }
  
  if (bits > 0) {
    base32 += base32alphabet[(value << (5 - bits)) & 31];
  }
  
  return base32;
}

// ============ Generate Secrets ============
console.log('\n✅ Generating secure secrets for production...\n');

const secrets = {
  ADMIN_SESSION_SECRET: generateBase64Secret(32),
  ADMIN_TOTP_SECRET: generateBase32Secret(32),
};

console.log('📋 ADMIN_SESSION_SECRET (JWT Session):');
console.log('  ', secrets.ADMIN_SESSION_SECRET);
console.log('\n📋 ADMIN_TOTP_SECRET (2FA TOTP):');
console.log('  ', secrets.ADMIN_TOTP_SECRET);

// ============ Instructions ============
console.log('\n' + '='.repeat(50));
console.log('\n📝 SETUP INSTRUCTIONS:\n');

console.log('1️⃣  Copy the secrets above to use in Vercel environment\n');

console.log('2️⃣  For ADMIN_PASSWORD, you need bcrypt hash:');
console.log('   Install bcryptjs globally:');
console.log('     npm install -g bcryptjs\n');
console.log('   Generate hash (replace YOUR-PASSWORD):');
console.log('     node -e "console.log(require(\'bcryptjs\').hashSync(\'YOUR-PASSWORD\', 10))"\n');

console.log('3️⃣  Go to Vercel Project Settings:');
console.log('   https://vercel.com/minonenkis-projects/u-finf/settings/environment-variables\n');

console.log('4️⃣  Add these environment variables:');
console.log('   Environment: Production and Preview');
console.log('   Sensitive: Yes (for all secrets)\n');

const envVars = [
  { key: 'ADMIN_EMAIL', value: 'admin@ufinf.com', hint: '(Change to your email)' },
  { key: 'ADMIN_PASSWORD', value: '<bcrypt-hash>', hint: '(See step 2 above)' },
  { key: 'ADMIN_SESSION_SECRET', value: secrets.ADMIN_SESSION_SECRET, hint: '(Copied above)' },
  { key: 'ADMIN_TOTP_SECRET', value: secrets.ADMIN_TOTP_SECRET, hint: '(Copied above)' },
  { key: 'STRIPE_SECRET_KEY', value: 'sk_test_YOUR_KEY', hint: '(From Stripe Dashboard)' },
  { key: 'STRIPE_WEBHOOK_SECRET', value: 'whsec_test_YOUR_SECRET', hint: '(From Stripe Webhooks)' },
];

console.log('📌 Required Environment Variables:\n');
envVars.forEach((env, i) => {
  console.log(`   ${i + 1}. ${env.key}`);
  console.log(`      Value: ${env.value}`);
  console.log(`      ${env.hint}\n`);
});

// ============ .env.local Creation ============
console.log('5️⃣  For local development, create .env.local:\n');

const envLocalContent = `# Local development - NEVER commit to git!

# Production URLs (change to production domain)
APP_PUBLIC_URL=https://ufinf.com
NEXT_PUBLIC_SITE_URL=https://ufinf.com

# Admin Panel
ADMIN_EMAIL=admin@ufinf.com
ADMIN_PASSWORD=\${PASSWORD_HASH_HERE}
ADMIN_SESSION_SECRET=${secrets.ADMIN_SESSION_SECRET}
ADMIN_TOTP_SECRET=${secrets.ADMIN_TOTP_SECRET}

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_WEBHOOK_SECRET
`;

console.log('  Save this to ai_growth_os/.env.local:');
console.log('  (Replace placeholders with actual values)\n');
console.log(envLocalContent);

// ============ Save to file ============
const outputFile = 'GENERATED_SECRETS.txt';
let output = '🔐 AI Growth OS - Generated Secrets\n';
output += '=====================================\n\n';
output += '⚠️  IMPORTANT: Keep these secrets secure!\n';
output += '⚠️  NEVER commit secrets to git!\n\n';

output += 'Generated Secrets (copy to Vercel):\n\n';
output += `ADMIN_SESSION_SECRET=${secrets.ADMIN_SESSION_SECRET}\n`;
output += `ADMIN_TOTP_SECRET=${secrets.ADMIN_TOTP_SECRET}\n\n`;

output += 'Still need from you:\n';
output += '- ADMIN_PASSWORD (bcrypt hashed)\n';
output += '- STRIPE_SECRET_KEY (from Stripe Dashboard)\n';
output += '- STRIPE_WEBHOOK_SECRET (from Stripe Webhooks)\n\n';

output += 'See ENV_VARIABLES_SETUP.md for complete instructions.\n';

try {
  fs.writeFileSync(outputFile, output);
  console.log(`✅ Secrets saved to: ${outputFile}\n`);
} catch (e) {
  console.log(`⚠️  Could not save to file: ${e.message}\n`);
}

console.log('=' .repeat(50));
console.log('\n✅ Next steps:');
console.log('   1. Add secrets to Vercel environment variables');
console.log('   2. Update STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET');
console.log('   3. Test deployment: git push (triggers Vercel rebuild)\n');
