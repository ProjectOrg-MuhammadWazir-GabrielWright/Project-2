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

// target form element
app.formEl = document.querySelector("form");

// Hacker news - Stories API - returns top 500 stores on site
app.topStoriesUrl = "https://hacker-news.firebaseio.com/v0/topstories.json";
// Hacker news - get item by id
app.itemUrl = `https://hacker-news.firebaseio.com/v0/item/`;
// Sentiments API url
app.sentimentUrl = "https://api.meaningcloud.com/sentiment-2.1";
// Proxy server url
app.proxyUrl = "http://proxy.hackeryou.com";
// Sentiments api key
app.sentimentApiKey = "1bf35516b59467add152b51d2139220e";

// Proxy method to get url
app.useProxy = (apiUrl, apiType, inputText) => {
	const url = new URL(app.proxyUrl);
	if (apiType == "hackerNews") {
		url.search = new URLSearchParams({
			reqUrl: apiUrl,
			"params[print]": "pretty",
		});
	} else if (apiType == "sentimentAnalyzer") {
		url.search = new URLSearchParams({
			reqUrl: apiUrl,
			"params[key]": app.sentimentApiKey,
			"params[txt]": inputText,
		});
	}
	return url;
};

// change icon based on sentiment score
app.updateIcon = (sentimentIcon, sentimentType) => {
	if (sentimentType === "AGREEMENT") {
		sentimentIcon.classList.add("fa-thumbs-up");
	} else if (sentimentType === "DISAGREEMENT") {
		sentimentIcon.classList.add("fa-thumbs-down");
	} else if (sentimentType === "IRONIC") {
		sentimentIcon.classList.add("fa-brain");
	} else if (sentimentType === "NONIRONIC") {
		sentimentIcon.classList.add("fa-rainbow");
	} else if (sentimentType === "SUBJECTIVE") {
		sentimentIcon.classList.add("fa-bolt-lightning");
	} else if (sentimentType === "OBJECTIVE") {
		sentimentIcon.classList.add("fa-sun");
	}
	// add solid coloring
	sentimentIcon.classList.add("fa-solid");
};

// display sentiment results
app.displaySentimentResults = (sentimentData) => {
	// target container
	const sentimentList = document.querySelector(".sentiment-list");

	// create list items for each sentiment
	const agreementListItem = document.createElement("li");
	const ironyListItem = document.createElement("li");
	const subjectivityListItem = document.createElement("li");

	// set list item content
	agreementListItem.textContent = sentimentData.agreement;
	ironyListItem.textContent = sentimentData.irony;
	subjectivityListItem.textContent = sentimentData.subjectivity;

	// create icons
	const agreementIcon = document.createElement("i");
	const ironyIcon = document.createElement("i");
	const subjectivityIcon = document.createElement("i");

	// update icon with appropriate class based on sentiment result
	app.updateIcon(agreementIcon, sentimentData.agreement);
	app.updateIcon(ironyIcon, sentimentData.irony);
	app.updateIcon(subjectivityIcon, sentimentData.subjectivity);

	// prepend icon to list item
	agreementListItem.prepend(agreementIcon);
	ironyListItem.prepend(ironyIcon);
	subjectivityListItem.prepend(subjectivityIcon);

	// append to DOM
	sentimentList.appendChild(agreementListItem);
	sentimentList.appendChild(ironyListItem);
	sentimentList.appendChild(subjectivityListItem);
};

// display article title
app.displayArticleTitle = (data) => {
	const articleTitleContainer = document.querySelector(
		".article-title-container"
	);
	const articleList = document.querySelector(".article-list");
	const articleListItem = document.createTextNode(data);
	articleList.prepend(articleListItem);
};

// display article links
app.displayArticleLinks = (data) => {
	const linkList = document.querySelector(".link-list");
	const linkListItem = document.createTextNode(data);
	linkList.appendChild(linkListItem);
};

// analyze sentiment of headline
app.analyzeSentiment = async (commentText) => {
	// query for sentiment
	fetch(app.useProxy(app.sentimentUrl, "sentimentAnalyzer", commentText))
		.then((res) => res.json())
		.then((sentimentData) => {
			// app.displaySentimentResults(sentimentData);
			console.log(sentimentData);
		});
};

// get comment text from story's comment array
app.getComments = (commentArr, commentInput) => {
	// shorten comments array to length specified by user
	const shortCommentArr = commentArr.slice(0, commentInput);
	shortCommentArr.forEach((commentId, i) => {
		setTimeout(function () {
			const commentUrl = `${app.itemUrl}${commentId}.json`;
			fetch(app.useProxy(commentUrl, "hackerNews"))
				.then((res) => res.json())
				.then((commentData) => {
					// query for sentiment
					app.analyzeSentiment(commentData.text);
				});
		}, i * 1200);
	});
};

// get top stories headlines
app.getStoryData = (storyId, commentInput) => {
	// build story url with story id
	const storyUrl = `${app.itemUrl}${storyId}.json`;
	// query for story details
	fetch(app.useProxy(storyUrl, "hackerNews"))
		.then((res) => res.json())
		.then((storyData) => {
			app.getComments(storyData.kids, commentInput);
			// app.displayArticleTitle(storyData.title);
			// app.displayArticleLinks(storyData.url);
		});
};

// get top stories objects
app.getTopStories = (articlesInput, commentsInput) => {
	// route request through Juno proxy
	fetch(app.useProxy(app.topStoriesUrl, "hackerNews"))
		.then((res) => {
			return res.json();
		})
		.then((dataArr) => {
			// query returns 500 by default - trim array to match user selection
			const articlesArr = dataArr.slice(0, articlesInput);
			articlesArr.forEach((storyId, i) => {
				setTimeout(function () {
					// loop over articles array to get story details by Id
					app.getStoryData(storyId, commentsInput);
				}, i * 2000);
			});
		});
};

// validate form input
app.validateInputs = (articleInput, commentInput) => {
	//check to make sure user selected a value for both dropdowns
	if (articleInput && commentInput) {
		return true;
	} else {
		return false;
	}
};

app.setupForm = (event) => {
	// prevent refresh
	event.preventDefault();

	// get user input from form
	const articlesInput = document.querySelector("#articles").value;
	const commentsInput = document.querySelector("#comments").value;

	// validate user input, if it passes, proceed
	if (app.validateInputs(articlesInput, commentsInput)) {
		// feed user inputs into Hacker News query
		app.getTopStories(articlesInput, commentsInput);
	} else {
		alert("Please enter both preferences");
	}
};

// init method
app.init = () => {
	// attach event listener to form submit
	app.formEl.addEventListener("submit", app.setupForm);
};

// call init
app.init();
