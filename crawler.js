const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class WebCrawler {
  constructor(options = {}) {
    this.timeout = options.timeout || 10000;
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  /**
   * Normalize URL to handle relative links
   * @param {string} link - The link to normalize
   * @param {string} baseUrl - The base URL to resolve relative links against
   * @returns {string} - Normalized absolute URL
   */
  normalizeUrl(link, baseUrl) {
    try {
      // Handle relative URLs
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
   * Extract all links from HTML content
   * @param {string} html - HTML content to parse
   * @param {string} baseUrl - Base URL for resolving relative links
   * @returns {Array} - Array of extracted links
   */
  extractLinks(html, baseUrl) {
    const $ = cheerio.load(html);
    const links = new Set();

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
      if (src && (src.startsWith('http') || src.startsWith('//'))) {
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

    return Array.from(links);
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
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error crawling ${url}:`, error.message);
      return {
        url: url,
        error: error.message,
        links: [],
        linkCount: 0,
        timestamp: new Date().toISOString()
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

module.exports = WebCrawler;