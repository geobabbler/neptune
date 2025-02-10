const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { Builder } = require('xml2js');
const schedule = require('node-schedule');
const ejs = require('ejs');

const app = express();
const port = 3010;

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
    const response = await axios.get(url);
    fs.writeFileSync(cachePath, response.data, 'utf8');
    return response.data;
  } catch (error) {
    console.error(`Error fetching feed from ${url}:`, error.message);
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
                source: item.source ? item.source[0] : 'Unknown source'
            }));

            resolve(feedItems);
        });
    });
};

// Generate aggregated RSS feed
const generateRSSFeed = async (feeds) => {
    // Flatten all feed items and sort by publication date
    const allItems = feeds.flatMap(feed =>
        feed.items.map(item => {
            const pubDate = item.original.pubDate ? 
                new Date(item.original.pubDate[0]).toUTCString() : 
                new Date(0).toUTCString();
            
            return {
                title: item.title,
                description: item.description || 'No description available',
                link: item.link || 'http://localhost:3000',
                pubDate: pubDate,
                source: item.source,
            };
        })
    ).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Generate RSS using EJS template
    return await ejs.renderFile(
        path.join(__dirname, 'views', 'rss.ejs'),
        { items: allItems }
    );
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
        const channel = parsedFeed.rss.channel[0];
        const feedTitle = channel.title[0];

        const feedItems = channel.item
          .filter((item) => {
            if (!lastRefreshTime) return true;
            const pubDate = item.pubDate ? new Date(item.pubDate[0]) : null;
            return pubDate && pubDate > lastRefreshTime;
          })
          .map((item) => ({
            title: item.title[0],
            description: item.description ? item.description[0] : '',
            link: item.link ? item.link[0] : 'http://localhost:3000',
            source: feedTitle,
            original: item,
          }));

        if (feedItems.length > 0) {
          aggregatedFeeds.push({ title: feedTitle, items: feedItems });
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

// Schedule aggregation at the 5th minute of every hour
schedule.scheduleJob('*/15 * * * *', () => {
  console.log('Scheduled aggregation job started at:', new Date().toLocaleString());
  aggregateFeeds();
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
app.get('/aggregate', async (req, res) => {
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

// Start server
app.listen(port, () => {
  console.log(`Feed aggregator app listening at http://localhost:${port}`);
});
