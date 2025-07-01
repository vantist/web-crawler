const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class EnhancedWebCrawler {
  constructor(options = {}) {
    this.timeout = options.timeout || 10000;
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.executeJavaScript = options.executeJavaScript || false;
  }

  /**
   * Normalize URL to handle relative links
   * @param {string} link - The link to normalize
   * @param {string} baseUrl - The base URL to resolve relative links against
   * @returns {string} - Normalized absolute URL
   */
  normalizeUrl(link, baseUrl) {
    try {
      // Handle data URLs, mailto, tel, etc.
      if (link.startsWith('data:') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('javascript:')) {
        return null;
      }
      
      // Handle protocol-relative URLs
      if (link.startsWith('//')) {
        const baseProtocol = new URL(baseUrl).protocol;
        return baseProtocol + link;
      }
      
      // Handle absolute URLs
      if (link.startsWith('http://') || link.startsWith('https://')) {
        return link;
      }
      
      // Create absolute URL from relative link
      const url = new URL(link, baseUrl);
      return url.href;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract JavaScript-generated URLs from script content
   * @param {string} scriptContent - JavaScript code content
   * @param {string} baseUrl - Base URL for resolving relative links
   * @returns {Array} - Array of extracted URLs
   */
  extractJavaScriptUrls(scriptContent, baseUrl) {
    const urls = new Set();
    
    // Common patterns for URLs in JavaScript
    const patterns = [
      // String literals with URLs
      /["'](https?:\/\/[^"']+)["']/g,
      /["']([^"']*\.(?:html|htm|php|asp|aspx|jsp|cfm)(?:[^"']*)??)["']/g,
      
      // window.location assignments
      /window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/g,
      /location\.href\s*=\s*["']([^"']+)["']/g,
      
      // Ajax/fetch calls
      /(?:fetch|ajax|get|post)\s*\(\s*["']([^"']+)["']/g,
      /url\s*:\s*["']([^"']+)["']/g,
      
      // Common navigation functions
      /(?:navigate|redirect|goto)\s*\(\s*["']([^"']+)["']/g,
      
      // Form actions
      /action\s*:\s*["']([^"']+)["']/g,
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(scriptContent)) !== null) {
        const url = this.normalizeUrl(match[1], baseUrl);
        if (url) {
          urls.add(url);
        }
      }
    });

    return Array.from(urls);
  }

  /**
   * Extract links from data attributes that might contain URLs
   * @param {CheerioStatic} $ - Cheerio instance
   * @param {string} baseUrl - Base URL
   * @returns {Array} - Array of extracted URLs
   */
  extractDataAttributeUrls($, baseUrl) {
    const urls = new Set();
    
    // Common data attributes that might contain URLs
    const dataAttributes = [
      'data-url', 'data-href', 'data-link', 'data-target',
      'data-src', 'data-action', 'data-endpoint', 'data-api'
    ];

    dataAttributes.forEach(attr => {
      $(`[${attr}]`).each((index, element) => {
        const value = $(element).attr(attr);
        if (value) {
          const url = this.normalizeUrl(value, baseUrl);
          if (url) {
            urls.add(url);
          }
        }
      });
    });

    return Array.from(urls);
  }

  /**
   * Extract URLs from onclick and other event handlers
   * @param {CheerioStatic} $ - Cheerio instance
   * @param {string} baseUrl - Base URL
   * @returns {Array} - Array of extracted URLs
   */
  extractEventHandlerUrls($, baseUrl) {
    const urls = new Set();
    
    const eventHandlers = ['onclick', 'onchange', 'onsubmit', 'onload'];
    
    eventHandlers.forEach(handler => {
      $(`[${handler}]`).each((index, element) => {
        const handlerCode = $(element).attr(handler);
        if (handlerCode) {
          const extractedUrls = this.extractJavaScriptUrls(handlerCode, baseUrl);
          extractedUrls.forEach(url => urls.add(url));
        }
      });
    });

    return Array.from(urls);
  }

  /**
   * Extract all links from HTML content (enhanced version)
   * @param {string} html - HTML content to parse
   * @param {string} baseUrl - Base URL for resolving relative links
   * @returns {Array} - Array of extracted links
   */
  extractLinks(html, baseUrl) {
    const $ = cheerio.load(html);
    const links = new Set();

    // Standard link extraction (from base class)
    this.extractStandardLinks($, baseUrl, links);
    
    // Enhanced JavaScript-aware extraction
    this.extractJavaScriptLinks($, baseUrl, links);
    
    // Extract from data attributes
    const dataUrls = this.extractDataAttributeUrls($, baseUrl);
    dataUrls.forEach(url => links.add(url));
    
    // Extract from event handlers
    const eventUrls = this.extractEventHandlerUrls($, baseUrl);
    eventUrls.forEach(url => links.add(url));

    return Array.from(links);
  }

  /**
   * Extract standard links (base functionality)
   * @param {CheerioStatic} $ - Cheerio instance
   * @param {string} baseUrl - Base URL
   * @param {Set} links - Set to add links to
   */
  extractStandardLinks($, baseUrl, links) {
    // Extract links from <a> tags
    $('a[href]').each((index, element) => {
      const href = $(element).attr('href');
      if (href) {
        const normalizedUrl = this.normalizeUrl(href, baseUrl);
        if (normalizedUrl) {
          links.add(normalizedUrl);
        }
      }
    });

    // Extract links from other elements with href attributes
    $('[href]').each((index, element) => {
      const href = $(element).attr('href');
      if (href) {
        const normalizedUrl = this.normalizeUrl(href, baseUrl);
        if (normalizedUrl) {
          links.add(normalizedUrl);
        }
      }
    });

    // Extract links from src attributes (images, scripts, etc.)
    $('[src]').each((index, element) => {
      const src = $(element).attr('src');
      if (src && (src.startsWith('http') || src.startsWith('/') || src.startsWith('../'))) {
        const normalizedUrl = this.normalizeUrl(src, baseUrl);
        if (normalizedUrl) {
          links.add(normalizedUrl);
        }
      }
    });

    // Extract links from action attributes (forms)
    $('form[action]').each((index, element) => {
      const action = $(element).attr('action');
      if (action) {
        const normalizedUrl = this.normalizeUrl(action, baseUrl);
        if (normalizedUrl) {
          links.add(normalizedUrl);
        }
      }
    });
  }

  /**
   * Extract JavaScript-generated links
   * @param {CheerioStatic} $ - Cheerio instance
   * @param {string} baseUrl - Base URL
   * @param {Set} links - Set to add links to
   */
  extractJavaScriptLinks($, baseUrl, links) {
    // Extract from inline scripts
    $('script').each((index, element) => {
      const scriptContent = $(element).html();
      if (scriptContent) {
        const jsUrls = this.extractJavaScriptUrls(scriptContent, baseUrl);
        jsUrls.forEach(url => links.add(url));
      }
    });

    // Extract from external script src attributes (already handled in standard extraction)
    // But we can also try to fetch and analyze external scripts if needed
  }

  /**
   * Crawl a single URL and extract all links
   * @param {string} url - URL to crawl
   * @returns {Promise<Object>} - Object containing URL, links, and metadata
   */
  async crawl(url) {
    try {
      console.log(`Crawling: ${url}`);
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent,
        },
        maxRedirects: 5,
      });

      const links = this.extractLinks(response.data, url);
      
      return {
        url: url,
        statusCode: response.status,
        links: links,
        linkCount: links.length,
        title: this.extractTitle(response.data),
        timestamp: new Date().toISOString(),
        enhancedExtraction: true
      };
    } catch (error) {
      console.error(`Error crawling ${url}:`, error.message);
      return {
        url: url,
        error: error.message,
        links: [],
        linkCount: 0,
        timestamp: new Date().toISOString(),
        enhancedExtraction: true
      };
    }
  }

  /**
   * Extract page title from HTML
   * @param {string} html - HTML content
   * @returns {string} - Page title
   */
  extractTitle(html) {
    try {
      const $ = cheerio.load(html);
      return $('title').text().trim() || 'No title found';
    } catch (error) {
      return 'No title found';
    }
  }

  /**
   * Filter links by type or pattern
   * @param {Array} links - Array of links to filter
   * @param {Object} options - Filter options
   * @returns {Array} - Filtered links
   */
  filterLinks(links, options = {}) {
    let filtered = [...links];

    if (options.includeInternal !== false && options.includeExternal !== false) {
      // No filtering needed
    } else if (options.baseUrl) {
      const baseDomain = new URL(options.baseUrl).hostname;
      
      if (options.includeInternal && !options.includeExternal) {
        // Only internal links
        filtered = filtered.filter(link => {
          try {
            return new URL(link).hostname === baseDomain;
          } catch {
            return false;
          }
        });
      } else if (options.includeExternal && !options.includeInternal) {
        // Only external links
        filtered = filtered.filter(link => {
          try {
            return new URL(link).hostname !== baseDomain;
          } catch {
            return false;
          }
        });
      }
    }

    if (options.excludePatterns) {
      filtered = filtered.filter(link => {
        return !options.excludePatterns.some(pattern => link.includes(pattern));
      });
    }

    return filtered;
  }
}

module.exports = EnhancedWebCrawler;