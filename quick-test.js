// Quick test to see what's actually loading
const https = require('https');

console.log('Testing what loads on your domains...\n');

const testUrl = (url) => {
    https.get(url, (res) => {
        console.log(`${url} - Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            if (data.includes('Your Yard. Clean. Safe. Always.')) {
                console.log('   ✅ Shows NEW Apple-inspired design!');
            } else if (data.includes('Professional Dog Waste Removal')) {
                console.log('   ⚠️  Shows old design - not Apple version');
            } else if (data.includes('<!DOCTYPE html>')) {
                console.log('   📄 Shows some website content');
            } else {
                console.log('   ❌ Not showing expected content');
            }
        });
    }).on('error', (err) => {
        console.log(`${url} - ERROR: ${err.message}`);
    });
};

testUrl('https://www.scoopunit.com');
testUrl('https://scoopunit-website.vercel.app');
testUrl('https://k1ngj4w5.github.io/scoopunit-website/');