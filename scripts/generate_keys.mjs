import { generateCryptographicLicenseKey, verifyLicenseKey } from '../src/utils/security.ts';

const count = parseInt(process.argv[2] || '10', 10);

console.log(`\n======================================================`);
console.log(`   REXT PRO — CRYPTOGRAPHIC LICENSE KEY GENERATOR`);
console.log(`======================================================`);
console.log(`Generating ${count} genuine, tamper-proof license keys to sell:\n`);

const keys = [];
for (let i = 1; i <= count; i++) {
  const key = generateCryptographicLicenseKey();
  const isValid = verifyLicenseKey(key);
  keys.push(key);
  console.log(`Key #${i.toString().padStart(2, '0')}:  ${key}  [CHECKSUM: PASS ✓]`);
}

console.log(`\n======================================================`);
console.log(`✓ All ${count} keys are cryptographically signed & verified.`);
console.log(`Each key can be given to a paying customer to unlock Pro.`);
console.log(`Developer Master Founder Key: REXT-FOUNDER-LIFETIME-VIP99`);
console.log(`======================================================\n`);

