const WebCrawler = require('./crawler');

// Test HTML content with various types of links
const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Page for Web Crawler</title>
    <link rel="stylesheet" href="/styles.css">
    <link rel="icon" href="https://example.com/favicon.ico">
</head>
<body>
    <h1>Test Page</h1>
    
    <!-- Standard links -->
    <a href="https://example.com">External Link 1</a>
    <a href="https://google.com">External Link 2</a>
    <a href="/internal/page">Internal Absolute Link</a>
    <a href="relative.html">Relative Link</a>
    <a href="../parent.html">Parent Directory Link</a>
    <a href="#section1">Fragment Link</a>
    
    <!-- Images -->
    <img src="https://example.com/image.jpg" alt="External Image">
    <img src="/images/local.png" alt="Local Image">
    
    <!-- Scripts -->
    <script src="https://cdn.example.com/script.js"></script>
    <script src="/js/app.js"></script>
    
    <!-- Forms -->
    <form action="/submit" method="post">
        <input type="submit" value="Submit">
    </form>
    <form action="https://example.com/api/contact" method="post">
        <input type="submit" value="Contact">
    </form>
    
    <!-- Other elements with links -->
    <iframe src="https://example.com/embed"></iframe>
    <video src="/videos/demo.mp4"></video>
</body>
</html>
`;

async function testCrawler() {
    console.log('=== Testing Web Crawler Link Extraction ===\n');
    
    const crawler = new WebCrawler();
    const baseUrl = 'https://testsite.com';
    
    // Test link extraction from HTML
    console.log('Extracting links from test HTML...\n');
    const links = crawler.extractLinks(testHtml, baseUrl);
    
    console.log(`Found ${links.length} links:\n`);
    links.forEach((link, index) => {
        console.log(`${index + 1}. ${link}`);
    });
    
    console.log('\n=== Testing Link Filtering ===\n');
    
    // Test internal links only
    const internalLinks = crawler.filterLinks(links, {
        baseUrl: baseUrl,
        includeInternal: true,
        includeExternal: false
    });
    
    console.log(`Internal links (${internalLinks.length}):`);
    internalLinks.forEach(link => console.log(`  - ${link}`));
    
    // Test external links only
    const externalLinks = crawler.filterLinks(links, {
        baseUrl: baseUrl,
        includeInternal: false,
        includeExternal: true
    });
    
    console.log(`\nExternal links (${externalLinks.length}):`);
    externalLinks.forEach(link => console.log(`  - ${link}`));
    
    // Test excluding patterns
    const filteredLinks = crawler.filterLinks(links, {
        excludePatterns: ['.jpg', '.png', '.mp4', '.js']
    });
    
    console.log(`\nLinks without media/scripts (${filteredLinks.length}):`);
    filteredLinks.forEach(link => console.log(`  - ${link}`));
    
    console.log('\n=== Test Completed Successfully ===');
}

// Run the test
testCrawler().catch(console.error);