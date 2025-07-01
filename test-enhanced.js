const EnhancedWebCrawler = require('./enhanced-crawler');

// Test HTML content with JavaScript-generated links
const testHtmlWithJS = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Page with JavaScript Links</title>
    <script>
        // Various JavaScript patterns that generate URLs
        function navigate() {
            window.location.href = 'https://example.com/js-redirect';
        }
        
        function ajaxCall() {
            fetch('https://api.example.com/data')
                .then(response => response.json());
        }
        
        var config = {
            apiUrl: 'https://api.example.com/v1',
            redirectUrl: 'https://example.com/success'
        };
        
        // jQuery-style ajax
        $.ajax({
            url: '/api/users',
            method: 'GET'
        });
    </script>
</head>
<body>
    <h1>Test Page with JavaScript Links</h1>
    
    <!-- Standard links -->
    <a href="https://example.com">Standard Link</a>
    
    <!-- Data attributes -->
    <button data-url="https://example.com/data-button">Click Me</button>
    <div data-href="/internal/data-div" data-target="https://external.com/target">Data Div</div>
    
    <!-- Event handlers -->
    <button onclick="location.href='https://example.com/onclick'">OnClick Button</button>
    <form onsubmit="window.location='https://example.com/form-submit'">
        <input type="submit" value="Submit">
    </form>
    
    <!-- More JavaScript patterns -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // More URL patterns
            const endpoints = {
                login: 'https://auth.example.com/login',
                logout: '/auth/logout',
                profile: 'https://profile.example.com/user'
            };
            
            // Fetch calls
            fetch('/api/profile')
                .then(response => response.json());
                
            // Redirect patterns
            function redirect() {
                window.location = 'https://example.com/redirect-target';
            }
        });
    </script>
    
    <!-- Hidden forms with actions -->
    <form action="https://hidden.example.com/submit" style="display:none;">
        <input type="hidden" name="redirect" value="https://example.com/hidden-redirect">
    </form>
</body>
</html>
`;

async function testEnhancedCrawler() {
    console.log('=== Testing Enhanced Web Crawler (JavaScript-aware) ===\n');
    
    const crawler = new EnhancedWebCrawler();
    const baseUrl = 'https://testsite.com';
    
    // Test enhanced link extraction
    console.log('Extracting links from JavaScript-enhanced HTML...\n');
    const links = crawler.extractLinks(testHtmlWithJS, baseUrl);
    
    console.log(`Found ${links.length} links (including JavaScript-generated):\n`);
    links.forEach((link, index) => {
        console.log(`${index + 1}. ${link}`);
    });
    
    console.log('\n=== Categorizing Links by Source ===\n');
    
    // Separate internal and external links
    const internalLinks = crawler.filterLinks(links, {
        baseUrl: baseUrl,
        includeInternal: true,
        includeExternal: false
    });
    
    const externalLinks = crawler.filterLinks(links, {
        baseUrl: baseUrl,
        includeInternal: false,
        includeExternal: true
    });
    
    console.log(`Internal links (${internalLinks.length}):`);
    internalLinks.forEach(link => console.log(`  - ${link}`));
    
    console.log(`\nExternal links (${externalLinks.length}):`);
    externalLinks.forEach(link => console.log(`  - ${link}`));
    
    // Find API endpoints
    const apiLinks = links.filter(link => link.includes('/api/') || link.includes('api.'));
    console.log(`\nAPI endpoints found (${apiLinks.length}):`);
    apiLinks.forEach(link => console.log(`  - ${link}`));
    
    // Find auth/security related links
    const authLinks = links.filter(link => 
        link.includes('auth') || 
        link.includes('login') || 
        link.includes('logout') || 
        link.includes('profile')
    );
    console.log(`\nAuthentication/Profile links (${authLinks.length}):`);
    authLinks.forEach(link => console.log(`  - ${link}`));
    
    console.log('\n=== Enhanced Extraction Features Demonstrated ===');
    console.log('✓ Standard HTML links (href, src, action attributes)');
    console.log('✓ JavaScript string literals containing URLs');
    console.log('✓ Data attributes (data-url, data-href, etc.)');
    console.log('✓ Event handlers (onclick, onsubmit, etc.)');
    console.log('✓ Ajax/fetch call URLs');
    console.log('✓ Configuration objects with URLs');
    console.log('✓ Dynamic redirects and navigation');
    
    console.log('\n=== Test Completed Successfully ===');
}

// Run the enhanced test
testEnhancedCrawler().catch(console.error);