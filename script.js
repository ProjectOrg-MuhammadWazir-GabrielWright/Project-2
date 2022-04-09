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
	} else {
		sentimentIcon.classList.add("fa-caret-right");
	}
	// add solid coloring
	sentimentIcon.classList.add("fa-solid");
};

// display sentiment results
app.displayResults = (storyData, sentimentData) => {
	// target results container
	const storyElem = document.querySelector(".results-container");

	// create container for comment
	const commentElem = document.createElement("ul");
	commentElem.setAttribute("id", `comment-sentiment`);

	// create list items for each sentiment
	const agreementListItem = document.createElement("li");
	const ironyListItem = document.createElement("li");
	const subjectivityListItem = document.createElement("li");

	// create list item for story url
	const linkListItem = document.createElement("li");
	const linkElem = document.createElement("a");

	// set list item content
	agreementListItem.textContent = sentimentData.agreement;
	ironyListItem.textContent = sentimentData.irony;
	subjectivityListItem.textContent = sentimentData.subjectivity;

	// create icons
	const agreementIcon = document.createElement("i");
	const ironyIcon = document.createElement("i");
	const subjectivityIcon = document.createElement("i");
	const caretIcon = document.createElement("i");

	// set up the story link
	linkElem.setAttribute("href", storyData.url);
	linkElem.textContent = "Full Article";
	linkListItem.appendChild(linkElem);
	app.updateIcon(caretIcon);
	linkListItem.append(caretIcon);

	// update icon with appropriate class based on sentiment result
	app.updateIcon(agreementIcon, sentimentData.agreement);
	app.updateIcon(ironyIcon, sentimentData.irony);
	app.updateIcon(subjectivityIcon, sentimentData.subjectivity);

	// prepend icon to list item
	agreementListItem.prepend(agreementIcon);
	ironyListItem.prepend(ironyIcon);
	subjectivityListItem.prepend(subjectivityIcon);

	// append list items to ulElem
	commentElem.appendChild(agreementListItem);
	commentElem.appendChild(ironyListItem);
	commentElem.appendChild(subjectivityListItem);
	commentElem.appendChild(linkListItem);

	// create container for story title
	const titleElem = document.createElement("h3");
	titleElem.classList.add("title-wrapper");
	titleElem.textContent = `${storyData.title} by ${storyData.by}`;

	// create element for article image
	const imgElem = document.createElement("img");
	imgElem.setAttribute("src", "./assets/luca-bravo-XJXWbfSo2f0-unsplash.jpg");
	imgElem.setAttribute("alt", "a generic computer-themed picture");

	// create overall sentiment text element
	const textElem = document.createElement("h4");
	textElem.textContent = "Overall user sentiment:";

	// create container for sentiment information
	const sentimentElem = document.createElement("div");
	sentimentElem.classList.add("sentiment-wrapper");

	// create story wrapper
	const storyWrapperElem = document.createElement("div");
	storyWrapperElem.classList.add("story-wrapper");

	// append to sentiment wrapper
	sentimentElem.appendChild(imgElem);
	sentimentElem.appendChild(textElem);
	sentimentElem.appendChild(commentElem);

	// append to story wrapper
	storyWrapperElem.appendChild(titleElem);
	storyWrapperElem.appendChild(sentimentElem);

	// append to DOM
	storyElem.appendChild(storyWrapperElem);
};

// analyze sentiment of headline
app.analyzeSentiment = (storyData, commentText) => {
	// query for sentiment
	fetch(app.useProxy(app.sentimentUrl, "sentimentAnalyzer", commentText))
		.then((res) => res.json())
		.then((sentimentData) => {
			// display results
			app.displayResults(storyData, sentimentData);
		});
};

// get comment text from story's comment array
app.getComments = async (storyData, storyId) => {
	// grab the first comment from story
	const commentId = storyData.kids[0];
	const commentUrl = `${app.itemUrl}${commentId}.json`;
	const res = await fetch(app.useProxy(commentUrl, "hackerNews"));
	const commentData = await res.json().text;

	// analyze comment text
	app.analyzeSentiment(storyData, commentData, storyId);
};

// get top stories headlines
app.getStoryData = (storyId) => {
	// build story url with story id
	const storyUrl = `${app.itemUrl}${storyId}.json`;
	// query for story details
	fetch(app.useProxy(storyUrl, "hackerNews"))
		.then((res) => res.json())
		.then((storyData) => {
			app.getComments(storyData, storyId);
		});
};

// get top stories objects
app.getTopStories = (articlesInput) => {
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
					app.getStoryData(storyId);
				}, i * 1000);
			});
		});
};

// validate form input
app.validateInputs = (articleInput) => {
	//check to make sure user selected a value for both dropdowns
	if (articleInput) {
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

	// validate user input, if it passes, proceed
	if (app.validateInputs(articlesInput)) {
		// feed user inputs into Hacker News query
		app.getTopStories(articlesInput);
	} else {
		alert("Please enter preference");
	}
};

// init method
app.init = () => {
	// attach event listener to form submit
	app.formEl.addEventListener("submit", app.setupForm);
};

// call init
app.init();
