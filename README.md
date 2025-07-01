# Web Crawler

一個使用 Node.js 實現的網路爬蟲，能夠解析網頁中的所有連結，包括透過 JavaScript 動作產生的連結。

A Node.js web crawler that extracts all links from a webpage, including JavaScript-generated links.

## Features

- 🔗 Extract all links from web pages
- ⚡ **Enhanced JavaScript-aware extraction** (default mode)
- 🌐 Support for both internal and external links
- 📝 Multiple output formats (JSON, TXT, CSV)
- 🎯 Flexible filtering options
- 🚀 Fast and lightweight
- 📋 Command-line interface
- 🔧 Extensible architecture with Puppeteer support

## Installation

```bash
git clone https://github.com/vantist/web-crawler.git
cd web-crawler
npm install
```

## Quick Start

```bash
# Basic usage - extract all links
node index.js https://example.com

# Enhanced mode with JavaScript extraction (default)
node index.js https://example.com --verbose

# Save results to file
node index.js https://example.com -o results.json

# Get only external links
node index.js https://example.com --external-only
```

## JavaScript Link Extraction

The crawler supports multiple levels of JavaScript link extraction:

### 1. Enhanced Mode (Default)
Extracts links from:
- ✅ Standard HTML elements (`<a>`, `<img>`, `<form>`, etc.)
- ✅ JavaScript string literals containing URLs
- ✅ Data attributes (`data-url`, `data-href`, etc.)
- ✅ Event handlers (`onclick`, `onsubmit`, etc.)
- ✅ AJAX/fetch calls and configuration objects
- ✅ Common navigation patterns

### 2. Full JavaScript Execution (Puppeteer)
For complete JavaScript execution, see `puppeteer-crawler.js`:
- ✅ Dynamically generated DOM elements
- ✅ Single-page application (SPA) routing
- ✅ Interactive elements requiring user actions
- ✅ Asynchronous content loading

## Usage Examples

### Command Line Interface

```bash
# Basic crawling
node index.js https://example.com

# Verbose output with enhanced extraction
node index.js https://example.com --verbose

# Save results to different formats
node index.js https://example.com -o results.json -f json
node index.js https://example.com -o links.txt -f txt
node index.js https://example.com -o data.csv -f csv

# Filter links
node index.js https://example.com --internal-only
node index.js https://example.com --external-only
node index.js https://example.com --exclude ".pdf" ".jpg" ".png"

# Use basic HTML-only extraction
node index.js https://example.com --basic

# Set custom timeout
node index.js https://example.com -t 15000
```

### Programmatic Usage

#### Basic Crawler
```javascript
const WebCrawler = require('./crawler');

const crawler = new WebCrawler({
  timeout: 10000
});

async function crawlWebsite() {
  const result = await crawler.crawl('https://example.com');
  console.log(`Found ${result.linkCount} links`);
  result.links.forEach(link => console.log(link));
}
```

#### Enhanced Crawler (JavaScript-aware)
```javascript
const EnhancedWebCrawler = require('./enhanced-crawler');

const crawler = new EnhancedWebCrawler({
  timeout: 10000
});

async function crawlWithJavaScript() {
  const result = await crawler.crawl('https://spa-website.com');
  
  // Filter API endpoints
  const apiLinks = result.links.filter(link => 
    link.includes('/api/') || link.includes('api.')
  );
  
  console.log('API endpoints found:', apiLinks);
}
```

## API Reference

### WebCrawler Class (Basic)

#### Constructor Options
- `timeout` (number): Request timeout in milliseconds (default: 10000)
- `userAgent` (string): User agent string for requests

#### Methods
- `crawl(url)`: Crawl a URL and extract all links
- `extractLinks(html, baseUrl)`: Extract links from HTML content
- `filterLinks(links, options)`: Filter links based on criteria
- `normalizeUrl(link, baseUrl)`: Normalize relative URLs to absolute URLs

### EnhancedWebCrawler Class (JavaScript-aware)

Extends WebCrawler with additional methods:
- `extractJavaScriptUrls(scriptContent, baseUrl)`: Extract URLs from JavaScript code
- `extractDataAttributeUrls($, baseUrl)`: Extract URLs from data attributes
- `extractEventHandlerUrls($, baseUrl)`: Extract URLs from event handlers

## Command Line Options

```
Usage: web-crawler [options] <url>

Arguments:
  url                      URL to crawl

Options:
  -V, --version            output the version number
  -o, --output <file>      output results to a JSON file
  -f, --format <format>    output format (json, txt, csv) (default: "json")
  -t, --timeout <ms>       request timeout in milliseconds (default: "10000")
  --internal-only          only include internal links (same domain)
  --external-only          only include external links (different domain)
  --exclude <patterns...>  exclude links containing these patterns
  --enhanced               use enhanced JavaScript-aware extraction (default)
  --basic                  use basic HTML-only link extraction
  --verbose                verbose output
  -h, --help               display help for command
```

## Output Format

### JSON Format
```json
{
  "url": "https://example.com",
  "statusCode": 200,
  "title": "Example Domain",
  "links": [
    "https://example.com/page1",
    "https://example.com/page2",
    "https://api.example.com/data"
  ],
  "linkCount": 3,
  "crawlerType": "enhanced",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

## Advanced Features

### Link Filtering
```javascript
const filteredLinks = crawler.filterLinks(links, {
  baseUrl: 'https://example.com',
  includeInternal: true,
  includeExternal: false,
  excludePatterns: ['.pdf', '.jpg', '.png']
});
```

### Custom User Agent
```javascript
const crawler = new EnhancedWebCrawler({
  userAgent: 'MyBot/1.0'
});
```

## Testing

Run the included tests to see the crawler in action:

```bash
# Test basic functionality
node test.js

# Test enhanced JavaScript extraction
node test-enhanced.js
```

## Extending with Puppeteer

For full JavaScript execution support, install Puppeteer:

```bash
npm install puppeteer
```

Then modify `puppeteer-crawler.js` as shown in the file comments.

## Link Types Extracted

### Standard HTML Elements
- `<a href="...">` - Hyperlinks
- `<link href="...">` - Stylesheets, favicons
- `<img src="...">` - Image sources  
- `<script src="...">` - Script sources
- `<form action="...">` - Form actions
- `<iframe src="...">` - Embedded content

### JavaScript Patterns (Enhanced Mode)
- String literals: `"https://example.com/api"`
- Window location: `window.location.href = "..."`
- AJAX calls: `fetch("/api/data")`
- Configuration objects: `{apiUrl: "..."}`
- Event handlers: `onclick="location.href='...'"`
- Data attributes: `data-url="..."`

## Browser Compatibility

The crawler sends requests with a modern browser user agent and handles:
- ✅ HTTP/HTTPS protocols
- ✅ Redirects (up to 5)
- ✅ Relative and absolute URLs
- ✅ Protocol-relative URLs (`//example.com`)
- ✅ Fragment identifiers (`#section`)
- ❌ `javascript:`, `mailto:`, `tel:` schemes (filtered out)

## Requirements

- Node.js 12.0 or higher
- Internet connection for crawling external websites

## Dependencies

- `axios` - HTTP client for making requests
- `cheerio` - Server-side jQuery implementation for HTML parsing
- `commander` - Command-line interface framework
- `jsdom` - DOM implementation for Node.js
- Optional: `puppeteer` - For full JavaScript execution

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Network Issues
- Increase timeout with `-t 30000`
- Check if the target website blocks automated requests
- Try using `--basic` mode for simpler extraction

### JavaScript-heavy Sites
- Use Puppeteer extension for full browser simulation
- Check browser console for JavaScript errors
- Consider adding wait times for dynamic content

### Performance
- Use filtering options to reduce output size
- Set appropriate timeouts for your use case
- Consider rate limiting for bulk crawling