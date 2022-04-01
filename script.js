/*
       // Problem:
       Sentiment Analyser for HackerNews Articles
​
       // Purpose:
       It parses through the user comments/feedback left on news articles
       and extracts information like emotional agreement, polarity,
       subjectivity, and irony to display to the user of the tool which
       they can use to better improve the quality of their product (news articles).
​
       // How to get/show data:
​
       1. Query the HackerNews API to extract the top 5 stories of the day
       2. Query for the details about those stories
       3. Extract comments from each story
       4. Use the comments to query a sentiment analyzer API
       5. Parse response from sentiment analyzer and display results to user
​
       // User Interface
​
       Our user is:
       - Anyone who wants to read tech news
​
       User pain:
       - They struggle to find articles that other users like/enjoy
       - They also want to get a sense of what other users' are saying about it
​
       Our tool (MVP):
       - Provides users with a feed of articles that they may enjoy
       - When the user interacts with an article they have two options:
​
       1. See what other's are saying/feeling about the article (sentiment)
       - If the user selects the sentiment option, they would see a full breakdown of
       the sentiment scores (emotional agreement, polarity, subjectivity, and irony).
       - If the user likes what they see in the preview, they can explore more by reading the full
       article
​
       2. Read more about the article
       - Interact with a link to read more
​
​
       // Stretch goals
​
       1. Getting Unsplash images to display for each article based on the title
       2. Displaying the sentiment scores using different icons (legend)
       3. Adding a landing page, with a call to action button which triggers the query
       4. Allow the user to choose how many articles to display from topstories list (default is 5)
       5. Allow the user to choose how many comments to analyze under each story (default is 1)
       6. Error handling
​
       // Pseudocode
​
       Step 1: Query for top articles via landing page
       - Has a query button on it with an event listener (form submit)
       - Event triggers, getTopStories method is called which hits the HackerNewsAPI and
       returns the top 5 articles ids in an array
​
       Step 2: Query for story details
       - Loop over the articles (getStoryData method) array and query the HackerNewsAPI by ID to get details about
       story which includes the comments in an array
       - Pass in the story title into the displayResults method (defined below)
​
       Step 3: Make a displayResults method
       - Target container in the DOM
       - Create elements to store the output from query
       - Set the text content of the elements to the queried results
       - Append the elements to the DOM using the container we that we targetted
​
       Step 3: Query for comments on each story
       - Loop over the comments array using getCommentdate method array and pass it into the
       analyzeSentiment method (defined below)
​
       Step 4: Make a analyzeSentiment method
       - Takes in text
       - Submits AJAX request to SentimentAnalyzerAPI
       - Outputs sentiment scores (emotional agreement, polarity, subjectivity, and irony)
​
       Step 5: Call displayResults method again
       - Which appends the sentiment results to the DOM for the user to see
                */

// namespace
const app = {};
//Hacker news - Stories API - returns top 500 stores on site
app.topStoriesUrl =
    "https://hacker-news.firebaseio.com/v0/topstories.json";
// Sentiments API url
app.sentimentUrl = "https://api.meaningcloud.com/sentiment-2.1";
// Proxy server url
app.proxyUrl = "http://proxy.hackeryou.com";
// Sentiments api key
app.sentimentApiKey = "1bf35516b59467add152b51d2139220e";

// Proxy method to get url
app.useProxy = (apiUrl, apiType, headlineText) => {
    const url = new URL(app.proxyUrl);
    if (apiType == "hackerNews") {
        url.search = new URLSearchParams({
            reqUrl: apiUrl,
            "params[print]": "pretty",
        });
    } else {
        url.search = new URLSearchParams({
            reqUrl: apiUrl,
            "params[key]": app.sentimentApiKey,
            "params[txt]": headlineText,
        });
    }
    return url;
};

// analyze sentiment of headline
app.analyzeSentiment = (headline) => {
    // build sentiment url with headline text
    const headlineUrl = `https://api.meaningcloud.com/sentiment-2.1`;
    // query for sentiment;
    fetch(app.useProxy(app.sentimentUrl, "", headline))
        .then((res) => res.json())
        .then((data) => {
            // console.log(headline);
            console.log(data);
        });
};

app.getComments = (commentArr) => {
    const shortArr = commentArr.slice(0, 1);
    shortArr.forEach((commentId) => {
        const commentUrl = `https://hacker-news.firebaseio.com/v0/item/${commentId}.json`;
        fetch(app.useProxy(commentUrl, "hackerNews"))
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                app.analyzeSentiment(data.text);
            });
    });
};

// get top stories headlines
app.getStoryData = (storyId) => {
    // build story url with story id
    const storyUrl = `https://hacker-news.firebaseio.com/v0/item/${storyId}.json`;
    // query for story details
    fetch(app.useProxy(storyUrl, "hackerNews"))
        .then((res) => res.json())
        .then((data) => {
            app.getComments(data.kids);
        });
};

// get top stories objects
app.getTopStories = () => {
    // route request through Juno proxy
    fetch(app.useProxy(app.topStoriesUrl))
        .then((res) => {
            return res.json();
        })
        .then((dataArr) => {
            // shorten array to only top 20 items
            const shortArr = dataArr.slice(0, 1);
            // loop over array of story IDs
            shortArr.forEach((storyId) => {
                app.getStoryData(storyId);
            });
        });
};

// init method
app.init = () => {
    app.getTopStories();
};

// call init
app.init();