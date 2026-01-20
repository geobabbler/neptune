/**
 * Generate self-signed SSL certificate for local HTTPS development
 * 
 * Run this once to generate the certificate files:
 * node generate-cert.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, 'certs');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');
const configPath = path.join(certDir, 'openssl.conf');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
  console.log('Created certs directory');
}

// Check if certificates already exist
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('Certificates already exist. Delete them first if you want to regenerate.');
  process.exit(0);
}

console.log('Generating self-signed certificate...');
console.log('This may take a moment...\n');

// Create a minimal OpenSSL config file to avoid Windows config issues
const opensslConfig = `[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Development
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
`;

try {
  // Write the config file
  fs.writeFileSync(configPath, opensslConfig);
  
  // Generate private key and certificate using the config file
  // This approach works better on Windows
  console.log('Step 1: Generating private key...');
  execSync(
    `openssl genrsa -out "${keyPath}" 2048`,
    { stdio: 'inherit' }
  );
  
  console.log('Step 2: Generating certificate...');
  execSync(
    `openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -config "${configPath}" -extensions v3_req`,
    { stdio: 'inherit' }
  );
  
  // Clean up config file (optional - we can keep it for regeneration)
  // fs.unlinkSync(configPath);
  
  console.log('\n✅ Certificates generated successfully!');
  console.log(`   Key: ${keyPath}`);
  console.log(`   Cert: ${certPath}`);
  console.log('\n⚠️  Note: Browsers will show a security warning for self-signed certificates.');
  console.log('   This is normal for local development. Click "Advanced" and proceed.');
} catch (error) {
  console.error('\n❌ Error generating certificate:', error.message);
  
  // Clean up on error
  if (fs.existsSync(keyPath)) fs.unlinkSync(keyPath);
  if (fs.existsSync(certPath)) fs.unlinkSync(certPath);
  if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
  
  console.log('\nTroubleshooting:');
  console.log('   1. Make sure OpenSSL is installed and in your PATH');
  console.log('   2. Windows: Try installing OpenSSL from https://slproweb.com/products/Win32OpenSSL.html');
  console.log('   3. Or use mkcert: https://github.com/FiloSottile/mkcert (recommended for trusted certs)');
  console.log('   4. Or use a service like ngrok for HTTPS tunneling');
  process.exit(1);
}
