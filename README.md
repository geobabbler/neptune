# Neptune Feed Aggregator

This project aggregates and processes RSS/Atom feeds listed in an OPML file and generates an aggregated HTML page and an RSS feed.

## Project Structure
- `cache/`: Stores cached feeds in XML format.
- `output/`: Stores the generated HTML and RSS files.
- `feeds.opml`: OPML file with feed URLs.

## To Run
1. Navigate to the project directory:
```
cd neptune
```

2. Install dependencies:
```
npm install
```

3. Start the server:
```
node app.js
```

Access the aggregated results at:
- HTML: [http://localhost:3000/aggregate](http://localhost:3000/aggregate)
- RSS: [http://localhost:3000/feed](http://localhost:3000/feed)
