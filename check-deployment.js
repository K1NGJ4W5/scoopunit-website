// Deployment Status Checker
// Run this to verify which deployment URLs are working

const https = require('https');

const urlsToCheck = [
    'https://scoopunit.com',
    'https://www.scoopunit.com',
    'https://scoopunit-website.vercel.app',
    'https://k1ngj4w5.github.io/scoopunit-website/'
];

console.log('🔍 Checking deployment status...\n');

urlsToCheck.forEach(url => {
    https.get(url, (res) => {
        console.log(`✅ ${url} - Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
            console.log(`   🎉 WORKING! Your Apple-inspired site is live here!`);
        }
    }).on('error', (err) => {
        console.log(`❌ ${url} - Error: ${err.message}`);
    });
});

console.log('\nIf any URL shows "✅ Status: 200", your site is live there!');
console.log('Look for "Your Yard. Clean. Safe. Always." headline to confirm Apple design.');