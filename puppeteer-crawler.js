/**
 * Puppeteer-based Web Crawler for Full JavaScript Support
 * 
 * This file demonstrates how to implement full JavaScript execution
 * for extracting dynamically generated links. 
 * 
 * To use this, install Puppeteer:
 * npm install puppeteer
 * 
 * Note: Puppeteer requires downloading Chromium browser (~100MB)
 */

// Uncomment the following code to use Puppeteer:

/*
const puppeteer = require('puppeteer');

class PuppeteerWebCrawler {
  constructor(options = {}) {
    this.timeout = options.timeout || 30000;
    this.waitForSelector = options.waitForSelector || 'body';
    this.waitTime = options.waitTime || 3000; // Wait for JS to execute
    this.headless = options.headless !== false;
  }

  async crawl(url) {
    let browser;
    try {
      console.log(`Launching browser and navigating to: ${url}`);
      
      browser = await puppeteer.launch({
        headless: this.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.timeout
      });
      
      // Wait for additional time for JavaScript to execute
      await page.waitForTimeout(this.waitTime);
      
      // Extract all links after JavaScript execution
      const links = await page.evaluate(() => {
        const linkSet = new Set();
        
        // Get all elements with href attributes
        document.querySelectorAll('[href]').forEach(el => {
          const href = el.getAttribute('href');
          if (href) linkSet.add(href);
        });
        
        // Get all elements with src attributes
        document.querySelectorAll('[src]').forEach(el => {
          const src = el.getAttribute('src');
          if (src) linkSet.add(src);
        });
        
        // Get all form actions
        document.querySelectorAll('form[action]').forEach(el => {
          const action = el.getAttribute('action');
          if (action) linkSet.add(action);
        });
        
        // Get data attributes that might contain URLs
        const dataAttributes = ['data-url', 'data-href', 'data-link', 'data-target'];
        dataAttributes.forEach(attr => {
          document.querySelectorAll(`[${attr}]`).forEach(el => {
            const value = el.getAttribute(attr);
            if (value) linkSet.add(value);
          });
        });
        
        return Array.from(linkSet);
      });
      
      // Get page title
      const title = await page.title();
      
      // Get final URL (in case of redirects)
      const finalUrl = page.url();
      
      // Normalize URLs
      const normalizedLinks = links
        .map(link => {
          try {
            return new URL(link, finalUrl).href;
          } catch {
            return null;
          }
        })
        .filter(link => link !== null);
      
      await browser.close();
      
      return {
        url: finalUrl,
        originalUrl: url,
        title: title,
        links: normalizedLinks,
        linkCount: normalizedLinks.length,
        timestamp: new Date().toISOString(),
        crawlerType: 'puppeteer',
        javascriptExecuted: true
      };
      
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      
      console.error(`Error crawling ${url}:`, error.message);
      return {
        url: url,
        error: error.message,
        links: [],
        linkCount: 0,
        timestamp: new Date().toISOString(),
        crawlerType: 'puppeteer',
        javascriptExecuted: false
      };
    }
  }
  
  // Additional methods for interacting with dynamic content
  async crawlWithInteraction(url, interactions = []) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: this.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Perform interactions (clicks, hovers, etc.)
      for (const interaction of interactions) {
        switch (interaction.type) {
          case 'click':
            await page.click(interaction.selector);
            break;
          case 'hover':
            await page.hover(interaction.selector);
            break;
          case 'type':
            await page.type(interaction.selector, interaction.text);
            break;
          case 'wait':
            await page.waitForTimeout(interaction.time);
            break;
        }
        
        // Wait after each interaction
        await page.waitForTimeout(1000);
      }
      
      // Extract links after interactions
      const links = await this.extractLinksFromPage(page);
      const title = await page.title();
      
      await browser.close();
      
      return {
        url: page.url(),
        title: title,
        links: links,
        linkCount: links.length,
        interactions: interactions,
        timestamp: new Date().toISOString(),
        crawlerType: 'puppeteer-interactive'
      };
      
    } catch (error) {
      if (browser) await browser.close();
      throw error;
    }
  }
}

module.exports = PuppeteerWebCrawler;
*/

// Export placeholder for now
module.exports = class PuppeteerWebCrawler {
  constructor() {
    throw new Error('Puppeteer crawler requires "npm install puppeteer" and uncommenting the code in puppeteer-crawler.js');
  }
};