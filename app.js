const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { Builder } = require('xml2js');
const schedule = require('node-schedule');
const ejs = require('ejs');
const RSS = require('rss');

const app = express();
const port = 8080;

// Add EJS configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Directory for cache and output
const cacheDir = path.join(__dirname, 'cache');
const outputDir = path.join(__dirname, 'output');

// Ensure directories exist
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Utility function to fetch and cache feeds
const fetchAndCacheFeed = async (url, cachePath) => {
  try {
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'RSS Feed Aggregator/1.0',
        'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*'
      },
      maxRedirects: 5
    });
    fs.writeFileSync(cachePath, response.data, 'utf8');
    return response.data;
  } catch (error) {
    console.error(`Error fetching feed from ${url}:`, error.message);
    // If cache exists, return cached data as fallback
    if (fs.existsSync(cachePath)) {
      console.log(`Using cached data for ${url}`);
      return fs.readFileSync(cachePath, 'utf8');
    }
    return null;
  }
};

// Parse OPML to extract feed URLs
const parseOPML = (opmlContent) => {
  const feedUrls = [];
  xml2js.parseString(opmlContent, (err, result) => {
    if (err) throw err;
    const outlines = result.opml.body[0].outline;
    outlines.forEach((outline) => {
      if (outline['$'] && outline['$'].xmlUrl) {
        feedUrls.push(outline['$'].xmlUrl);
      }
    });
  });
  return feedUrls;
};

// Minimal content filtering (strip HTML tags from titles)
const filterFeedContent = (feedXml) => {
  const $ = cheerio.load(feedXml, { xmlMode: true });
  $('title').each((_, elem) => {
    const text = $(elem).text();
    $(elem).text(text.replace(/<[^>]+>/g, ''));
  });
  return $.xml();
};

// Aggregate and render feeds
const renderFeeds = (rssFeed) => {
    return new Promise((resolve, reject) => {
        xml2js.parseString(rssFeed, (err, result) => {
            if (err) reject(err);

            const items = result.rss.channel[0].item || [];
            const feedItems = items.map((item) => ({
                title: item.title ? item.title[0] : 'No title',
                description: item.description ? item.description[0] : 'No description',
                link: item.link ? item.link[0] : '#',
                pubDate: item.pubDate ? item.pubDate[0] : 'Unknown date',
                source: item.source ? item.source[0]._ : 'Unknown source',
                author: item.author ? item.author[0] : 
                        item['dc:creator'] ? item['dc:creator'][0] : null
            }));

            // Sort items by publication date (newest first)
            feedItems.sort((a, b) => {
                const dateA = new Date(a.pubDate);
                const dateB = new Date(b.pubDate);
                return dateB - dateA;
            });

            resolve(feedItems);
        });
    });
};

// Main aggregation function
const aggregateFeeds = async (useCache = true, lastRefreshTime = null) => {
  try {
    const opmlFile = path.join(__dirname, 'feeds.opml');
    const opmlContent = fs.readFileSync(opmlFile, 'utf8');
    const feedUrls = parseOPML(opmlContent);

    const aggregatedFeeds = [];

    for (const url of feedUrls) {
      const cachePath = path.join(cacheDir, `${Buffer.from(url).toString('hex')}.xml`);
      let feedData;

      if (useCache && fs.existsSync(cachePath)) {
        feedData = fs.readFileSync(cachePath, 'utf8');
      } else {
        feedData = await fetchAndCacheFeed(url, cachePath);
      }

      if (feedData) {
        const filteredData = filterFeedContent(feedData);
        const parsedFeed = await xml2js.parseStringPromise(filteredData);
        
        // Determine feed type and extract items
        const feedInfo = parseFeedItems(parsedFeed);
        
        if (feedInfo && feedInfo.items.length > 0) {
          aggregatedFeeds.push(feedInfo);
        }
      }
    }

    // Generate RSS output
    const rssFeed = await generateRSSFeed(aggregatedFeeds);
    const rssFile = path.join(outputDir, 'aggregated.xml');
    fs.writeFileSync(rssFile, rssFeed);

    // Generate HTML output based on the generated RSS feed
    const feedItems = await renderFeeds(rssFeed);
    const html = await ejs.renderFile(
        path.join(__dirname, 'views', 'feeds.ejs'),
        { items: feedItems }
    );
    const outputFile = path.join(outputDir, 'aggregated.html');
    fs.writeFileSync(outputFile, html);

    console.log('Aggregation completed successfully.');
  } catch (error) {
    console.error('Error during aggregation:', error);
  }
};

// Helper function to parse both RSS and Atom feeds
const parseFeedItems = (parsedFeed) => {
  try {
    // Check if it's an Atom feed
    if (parsedFeed.feed) {
      const feed = parsedFeed.feed;
      const feedTitle = feed.title ? feed.title[0]._ || feed.title[0] : 'Untitled Feed';
      const items = feed.entry ? feed.entry.map(entry => ({
        title: entry.title ? entry.title[0]._ || entry.title[0] : 'Untitled',
        description: entry.content ? entry.content[0]._ || entry.content[0] : 
                    entry.summary ? entry.summary[0]._ || entry.summary[0] : '',
        link: entry.link ? entry.link.find(l => l.$.rel === 'alternate')?.$.href || entry.link[0].$.href : '',
        pubDate: entry.updated ? entry.updated[0] : entry.published ? entry.published[0] : new Date().toISOString(),
        source: feedTitle,
        author: entry.author ? entry.author[0].name ? entry.author[0].name[0] : '' : '',
        original: entry
      })) : [];
      return { title: feedTitle, items };
    }
    
    // Handle RSS feed
    if (parsedFeed.rss && parsedFeed.rss.channel) {
      const channel = parsedFeed.rss.channel[0];
      const feedTitle = channel.title[0];

      const items = channel.item ? channel.item.map(item => ({
        title: item.title ? item.title[0] : 'Untitled',
        description: item.description ? item.description[0] : '',
        link: item.link ? item.link[0] : '',
        pubDate: item.pubDate ? item.pubDate[0] : 
                item.date ? item.date[0] : new Date().toUTCString(),
        source: feedTitle,
        //author: item["dc:creator"] ? item["dc:creator"][0] : '',
        original: item
      })) : [];
      //console.log(items[0].author);
      return { title: feedTitle, items };
    }

    // Handle RDF (RSS 1.0) feed
    if (parsedFeed['rdf:RDF']) {
      const rdf = parsedFeed['rdf:RDF'];
      const channel = rdf.channel[0];
      const feedTitle = channel.title[0];

      const items = rdf.item ? rdf.item.map(item => ({
        title: item.title ? item.title[0] : 'Untitled',
        description: item.description ? item.description[0] : '',
        link: item.link ? item.link[0] : '',
        pubDate: item['dc:date'] ? item['dc:date'][0] : new Date().toUTCString(),
        source: feedTitle,
        original: item
      })) : [];

      return { title: feedTitle, items };
    }

    return null;
  } catch (error) {
    console.error('Error parsing feed:', error);
    return null;
  }
};

// Generate aggregated RSS feed
const generateRSSFeed = async (feeds) => {
    // Flatten all items and remove duplicates based on link
    const allItems = feeds.flatMap(feed => feed.items);
    const uniqueItems = allItems.filter((item, index, self) =>
        index === self.findIndex((t) => t.link === item.link)
    );
    
    // Sort by publication date (newest first)
    uniqueItems.sort((a, b) => {
        const dateA = a.original.pubDate ? new Date(a.original.pubDate[0]) : new Date(0);
        const dateB = b.original.pubDate ? new Date(b.original.pubDate[0]) : new Date(0);
        return dateB - dateA;
    });

    // Generate RSS using EJS template
    return await ejs.renderFile(
        path.join(__dirname, 'views', 'rss.ejs'),
        { items: uniqueItems }
    );
};

// Schedule aggregation at the 5th minute of every hour
schedule.scheduleJob('*/15 * * * *', () => {
  console.log('Scheduled aggregation job started at:', new Date().toLocaleString());
  aggregateFeeds(false);
});

// Rebuild method to forcefully regenerate feeds without using cache
app.post('/rebuild', async (req, res) => {
  try {
    console.log('Rebuild triggered: Regenerating feeds from source.');
    await aggregateFeeds(false);
    res.status(200).send('Rebuild completed successfully.');
  } catch (error) {
    console.error('Error during rebuild:', error.message);
    res.status(500).send('Error during rebuild.');
  }
});

// Endpoint to serve the aggregated HTML
app.get('/view', async (req, res) => {
    try {
        const rssFile = path.join(outputDir, 'aggregated.xml');
        if (!fs.existsSync(rssFile)) {
            return res.status(500).send('Aggregated RSS feed is not available.');
        }
        
        const rssFeed = fs.readFileSync(rssFile, 'utf8');
        const feedItems = await renderFeeds(rssFeed);
        res.render('feeds', { items: feedItems });
    } catch (error) {
        console.error('Error rendering feeds:', error);
        res.status(500).send('Error rendering feeds.');
    }
});

// Endpoint to serve the aggregated RSS feed
app.get('/feed', async (req, res) => {
    try {
        const rssFile = path.join(outputDir, 'aggregated.xml');
        if (!fs.existsSync(rssFile)) {
            return res.status(500).send('Aggregated RSS feed is not available.');
        }
        
        res.set('Content-Type', 'application/xml');
        res.send(fs.readFileSync(rssFile, 'utf8'));
    } catch (error) {
        console.error('Error serving RSS feed:', error);
        res.status(500).send('Error serving RSS feed.');
    }
});

// Initial rebuild to ensure feeds are up to date
(async () => {
  console.log('Initial rebuild on startup...');
  await aggregateFeeds(false);
})();

// Add this function to parse OPML and return feed info
const getFeedList = async () => {
    const opmlFile = path.join(__dirname, 'feeds.opml');
    const opmlContent = fs.readFileSync(opmlFile, 'utf8');
    const parser = new xml2js.Parser();
    
    try {
        const opmlData = await parser.parseStringPromise(opmlContent);
        const outlines = opmlData.opml.body[0].outline;
        return outlines
            .map(outline => ({
                title: outline.$.title || outline.$.text,
                xmlUrl: outline.$.xmlUrl
            }))
            .sort((a, b) => a.title.localeCompare(b.title)); // Sort alphabetically
    } catch (error) {
        console.error('Error parsing OPML:', error);
        return [];
    }
};

// Update the endpoint to handle async function
app.get('/list', async (req, res) => {
    try {
        const feeds = await getFeedList();
        const html = await ejs.renderFile(
            path.join(__dirname, 'views', 'list.ejs'),
            { feeds }
        );
        res.send(html);
    } catch (error) {
        console.error('Error generating feed list:', error);
        res.status(500).send('Error generating feed list');
    }
});

// Add this route at the top of your route definitions
app.get('/', (req, res) => {
    res.redirect(301, '/view');
});

// Start server
app.listen(port, () => {
  console.log(`Feed aggregator app listening at http://localhost:${port}`);
});
