#!/usr/bin/env node

const { Command } = require('commander');
const WebCrawler = require('./crawler');
const EnhancedWebCrawler = require('./enhanced-crawler');

const program = new Command();

program
  .name('web-crawler')
  .description('A Node.js web crawler that extracts all links from a webpage')
  .version('1.0.0');

program
  .argument('<url>', 'URL to crawl')
  .option('-o, --output <file>', 'output results to a JSON file')
  .option('-f, --format <format>', 'output format (json, txt, csv)', 'json')
  .option('-t, --timeout <ms>', 'request timeout in milliseconds', '10000')
  .option('--internal-only', 'only include internal links (same domain)')
  .option('--external-only', 'only include external links (different domain)')
  .option('--exclude <patterns...>', 'exclude links containing these patterns')
  .option('--enhanced', 'use enhanced JavaScript-aware link extraction (default)', true)
  .option('--basic', 'use basic HTML-only link extraction')
  .option('--verbose', 'verbose output')
  .action(async (url, options) => {
    try {
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Choose crawler type
      const CrawlerClass = options.basic ? WebCrawler : EnhancedWebCrawler;
      const crawler = new CrawlerClass({
        timeout: parseInt(options.timeout)
      });

      if (options.verbose) {
        console.log(`Starting crawl of: ${url}`);
        console.log(`Crawler: ${options.basic ? 'Basic' : 'Enhanced (JavaScript-aware)'}`);
        console.log(`Timeout: ${options.timeout}ms`);
        console.log(`Format: ${options.format}`);
      }

      const result = await crawler.crawl(url);

      if (result.error) {
        console.error(`Failed to crawl ${url}: ${result.error}`);
        process.exit(1);
      }

      // Filter links based on options
      let filteredLinks = result.links;
      
      const filterOptions = {
        baseUrl: url,
        includeInternal: !options.externalOnly,
        includeExternal: !options.internalOnly,
        excludePatterns: options.exclude
      };

      filteredLinks = crawler.filterLinks(filteredLinks, filterOptions);

      const output = {
        ...result,
        links: filteredLinks,
        linkCount: filteredLinks.length,
        crawlerType: options.basic ? 'basic' : 'enhanced',
        filters: {
          internalOnly: options.internalOnly || false,
          externalOnly: options.externalOnly || false,
          excludePatterns: options.exclude || []
        }
      };

      // Output results
      if (options.output) {
        const fs = require('fs');
        if (options.format === 'json') {
          fs.writeFileSync(options.output, JSON.stringify(output, null, 2));
        } else if (options.format === 'txt') {
          const content = filteredLinks.join('\n');
          fs.writeFileSync(options.output, content);
        } else if (options.format === 'csv') {
          const header = 'URL,Title,Status\n';
          const rows = filteredLinks.map(link => `"${link}","",""`).join('\n');
          fs.writeFileSync(options.output, header + rows);
        }
        console.log(`Results saved to: ${options.output}`);
      } else {
        // Console output
        if (options.format === 'json') {
          console.log(JSON.stringify(output, null, 2));
        } else if (options.format === 'txt') {
          filteredLinks.forEach(link => console.log(link));
        } else {
          console.log('\n=== Crawl Results ===');
          console.log(`URL: ${output.url}`);
          console.log(`Title: ${output.title}`);
          console.log(`Status: ${output.statusCode}`);
          console.log(`Crawler: ${output.crawlerType}`);
          console.log(`Total Links Found: ${output.linkCount}`);
          console.log(`Timestamp: ${output.timestamp}`);
          console.log('\n=== Links ===');
          filteredLinks.forEach((link, index) => {
            console.log(`${index + 1}. ${link}`);
          });
        }
      }

      if (options.verbose) {
        console.log(`\nCrawl completed successfully!`);
        console.log(`Found ${output.linkCount} links`);
        
        if (!options.basic) {
          console.log('\nNote: Enhanced mode extracts JavaScript-generated links from:');
          console.log('  - Inline scripts and event handlers');
          console.log('  - Data attributes (data-url, data-href, etc.)');
          console.log('  - AJAX/fetch calls and configuration objects');
          console.log('  - For full JavaScript execution, consider using Puppeteer');
        }
      }

    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();