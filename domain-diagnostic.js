// Vercel Domain Diagnostic Tool for scoopunit.com
// This will help identify domain configuration issues

const dns = require('dns');
const https = require('https');

console.log('🔍 Diagnosing scoopunit.com domain configuration...\n');

// Check DNS records
console.log('1. Checking DNS Records:');
console.log('=' .repeat(40));

// Check A record
dns.resolve4('scoopunit.com', (err, addresses) => {
    if (err) {
        console.log('❌ A Record (scoopunit.com): NOT FOUND');
        console.log('   Fix: Add A record pointing to 76.76.19.61');
    } else {
        console.log(`✅ A Record (scoopunit.com): ${addresses[0]}`);
        if (addresses[0] === '76.76.19.61') {
            console.log('   ✓ Correct Vercel IP address');
        } else {
            console.log('   ⚠️  Should be 76.76.19.61 for Vercel');
        }
    }
});

// Check CNAME record for www
dns.resolveCname('www.scoopunit.com', (err, addresses) => {
    if (err) {
        console.log('❌ CNAME Record (www.scoopunit.com): NOT FOUND');
        console.log('   Fix: Add CNAME record pointing to cname.vercel-dns.com');
    } else {
        console.log(`✅ CNAME Record (www.scoopunit.com): ${addresses[0]}`);
        if (addresses[0].includes('vercel-dns.com')) {
            console.log('   ✓ Correct Vercel CNAME');
        } else {
            console.log('   ⚠️  Should point to cname.vercel-dns.com');
        }
    }
});

// Check SSL/HTTPS status
console.log('\n2. Checking HTTPS Status:');
console.log('=' .repeat(40));

const checkHTTPS = (hostname) => {
    https.get(`https://${hostname}`, (res) => {
        console.log(`✅ HTTPS ${hostname}: Status ${res.statusCode}`);
        console.log(`   SSL Certificate: ${res.socket.getPeerCertificate().issuer.O || 'Unknown'}`);
        
        if (res.statusCode === 200) {
            console.log('   🎉 Website is accessible!');
        } else if (res.statusCode === 301 || res.statusCode === 302) {
            console.log(`   🔄 Redirecting to: ${res.headers.location}`);
        }
    }).on('error', (err) => {
        console.log(`❌ HTTPS ${hostname}: ${err.message}`);
        if (err.code === 'ENOTFOUND') {
            console.log('   Issue: Domain not resolving - check DNS settings');
        } else if (err.code === 'CERT_HAS_EXPIRED') {
            console.log('   Issue: SSL certificate expired');
        }
    });
};

setTimeout(() => {
    checkHTTPS('scoopunit.com');
    checkHTTPS('www.scoopunit.com');
}, 2000);

// Provide configuration recommendations
setTimeout(() => {
    console.log('\n3. Recommended Vercel Configuration:');
    console.log('=' .repeat(40));
    console.log('In your Vercel project settings:');
    console.log('');
    console.log('Domains to add:');
    console.log('• scoopunit.com (set as primary)');
    console.log('• www.scoopunit.com (redirect to scoopunit.com)');
    console.log('');
    console.log('DNS Records needed at your domain registrar:');
    console.log('Type: A     | Name: @   | Value: 76.76.19.61');
    console.log('Type: CNAME | Name: www | Value: cname.vercel-dns.com');
    console.log('');
    console.log('4. Common Issues & Solutions:');
    console.log('=' .repeat(40));
    console.log('❌ "Domain already exists": Remove from other Vercel projects');
    console.log('❌ "DNS not configured": Wait 15-60 min after adding DNS records');
    console.log('❌ "SSL pending": Wait 5-10 min for automatic certificate');
    console.log('❌ "404 Not Found": Check project is connected to correct GitHub repo');
    console.log('');
    console.log('🔧 Quick Fixes:');
    console.log('1. Delete unused Vercel projects');
    console.log('2. Redeploy latest version');
    console.log('3. Clear browser cache (Ctrl+F5)');
    console.log('4. Try incognito mode');
}, 4000);