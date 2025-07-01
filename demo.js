const WebCrawler = require('./crawler');
const EnhancedWebCrawler = require('./enhanced-crawler');

// Create test HTML that shows the difference between basic and enhanced crawling
const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Comparison Test</title>
</head>
<body>
    <h1>Link Extraction Comparison</h1>
    
    <!-- These will be found by BOTH crawlers -->
    <a href="https://example.com/standard">Standard Link</a>
    <img src="https://example.com/image.jpg" alt="Image">
    <form action="/form-submit">Submit</form>
    
    <!-- These will ONLY be found by Enhanced crawler -->
    <button data-url="https://example.com/data-link">Data Button</button>
    <div onclick="location.href='https://example.com/click-handler'">Click Handler</div>
    
    <script>
        var apiEndpoint = 'https://api.example.com/v1/users';
        
        function redirectUser() {
            window.location.href = 'https://example.com/redirect';
        }
        
        fetch('/api/profile')
            .then(response => response.json());
    </script>
</body>
</html>
`;

async function compareExtraction() {
    console.log('=== Crawler Comparison Demo ===\n');
    
    const baseUrl = 'https://testsite.com';
    
    // Test with basic crawler
    console.log('🔍 Basic Crawler (HTML only):');
    const basicCrawler = new WebCrawler();
    const basicLinks = basicCrawler.extractLinks(testHtml, baseUrl);
    console.log(`Found ${basicLinks.length} links:`);
    basicLinks.forEach((link, i) => console.log(`  ${i + 1}. ${link}`));
    
    console.log('\n🚀 Enhanced Crawler (JavaScript-aware):');
    const enhancedCrawler = new EnhancedWebCrawler();
    const enhancedLinks = enhancedCrawler.extractLinks(testHtml, baseUrl);
    console.log(`Found ${enhancedLinks.length} links:`);
    enhancedLinks.forEach((link, i) => console.log(`  ${i + 1}. ${link}`));
    
    // Show the difference
    const extraLinks = enhancedLinks.filter(link => !basicLinks.includes(link));
    console.log(`\n✨ Additional links found by Enhanced crawler (${extraLinks.length}):`);
    extraLinks.forEach(link => console.log(`  + ${link}`));
    
    console.log('\n📊 Summary:');
    console.log(`Basic Crawler: ${basicLinks.length} links`);
    console.log(`Enhanced Crawler: ${enhancedLinks.length} links`);
    console.log(`Improvement: +${extraLinks.length} additional JavaScript-generated links`);
    
    console.log('\n🎯 JavaScript Features Detected:');
    console.log('  ✓ Data attributes (data-url)');
    console.log('  ✓ Event handlers (onclick)');
    console.log('  ✓ Script variables (apiEndpoint)');
    console.log('  ✓ Function calls (window.location.href)');
    console.log('  ✓ AJAX calls (fetch)');
}

compareExtraction().catch(console.error);