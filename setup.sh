#!/bin/bash

# Define the base directory where the project will be created
BASE_DIR="."

# Create the directory structure
mkdir -p "$BASE_DIR/cache"
mkdir -p "$BASE_DIR/output"

# Create key files
touch "$BASE_DIR/feeds.opml"
cat <<EOF > "$BASE_DIR/README.md"
# Feed Aggregator App

This project aggregates and processes RSS/Atom feeds listed in an OPML file and generates an aggregated HTML page and an RSS feed.

## Project Structure
- \`cache/\`: Stores cached feeds in XML format.
- \`output/\`: Stores the generated HTML and RSS files.
- \`feeds.opml\`: OPML file with feed URLs.

## To Run
1. Navigate to the project directory:
\`\`\`
cd my-feed-aggregator-app
\`\`\`

2. Install dependencies:
\`\`\`
npm install
\`\`\`

3. Start the server:
\`\`\`
node app.js
\`\`\`

Access the aggregated results at:
- HTML: [http://localhost:3000/aggregate](http://localhost:3000/aggregate)
- RSS: [http://localhost:3000/feed](http://localhost:3000/feed)
EOF

echo "Directory structure for the feed aggregator app created successfully."
