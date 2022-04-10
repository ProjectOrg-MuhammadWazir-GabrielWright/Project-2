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

// target buttons
app.showMoreButtonEl = document.querySelector("#show-more-button");
app.changeButtonEl = document.querySelector("#change-preferences-button");

// variable to store previous start position in stories arr
app.prevArrEndPosition = 0;

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

app.updateIcon = (sentimentIcon, sentimentType) => {
	// set icon based on sentiment score
	switch (sentimentType) {
		case "AGREEMENT":
			sentimentIcon.classList.add("fa-thumbs-up");
			break;
		case "DISAGREEMENT":
			sentimentIcon.classList.add("fa-thumbs-down");
			break;
		case "IRONIC":
			sentimentIcon.classList.add("fa-brain");
			break;
		case "NONIRONIC":
			sentimentIcon.classList.add("fa-rainbow");
			break;
		case "SUBJECTIVE":
			sentimentIcon.classList.add("fa-bolt-lightning");
			break;
		case "OBJECTIVE":
			sentimentIcon.classList.add("fa-sun");
			break;
		default:
			sentimentIcon.classList.add("fa-caret-right");
	}

	// add solid coloring
	sentimentIcon.classList.add("fa-solid");
};

app.setupStoryLink = (linkElem, storyData, linkListItem, caretIcon) => {
	// set link content
	linkElem.setAttribute("href", storyData.url);
	linkElem.setAttribute("target", "_blank");
	linkElem.textContent = "Full Article";
	// build the hyperlink and icon
	linkListItem.appendChild(linkElem);
	app.updateIcon(caretIcon);
	linkListItem.append(caretIcon);
};

app.appendSentiment = (
	commentElem,
	agreementListItem,
	ironyListItem,
	subjectivityListItem,
	linkListItem
) => {
	commentElem.appendChild(agreementListItem);
	commentElem.appendChild(ironyListItem);
	commentElem.appendChild(subjectivityListItem);
	commentElem.appendChild(linkListItem);
};

app.buildStoryContainer = (
	sentimentElem,
	textElem,
	imgListContainerElem,
	imgContainerElem,
	listContainerElem,
	imgElem,
	commentElem,
	storyWrapperElem,
	titleContainerElem,
	titleElem,
	resultsElem
) => {
	// append to sentiment wrapper
	sentimentElem.appendChild(textElem);
	sentimentElem.appendChild(imgListContainerElem);
	imgListContainerElem.appendChild(imgContainerElem);
	imgListContainerElem.appendChild(listContainerElem);

	// append to image container
	imgContainerElem.appendChild(imgElem);
	listContainerElem.appendChild(commentElem);

	// append to story wrapper
	storyWrapperElem.appendChild(titleContainerElem);
	storyWrapperElem.appendChild(sentimentElem);

	// append title to title container
	titleContainerElem.appendChild(titleElem);

	// append to DOM
	resultsElem.prepend(storyWrapperElem);
};

app.useSmoothScrollEffect = () => {
	document.querySelector("#results").scrollIntoView({
		behavior: "smooth",
		block: "start",
		inline: "nearest",
	});
};

app.addClasses = (
	titleElem,
	titleContainerElem,
	sentimentElem,
	imgListContainerElem,
	imgContainerElem,
	listContainerElem,
	storyWrapperElem
) => {
	titleElem.classList.add("article-title");
	titleContainerElem.classList.add("article-title-container");
	sentimentElem.classList.add("sentiment-container");
	imgListContainerElem.classList.add("img-list-container");
	imgContainerElem.classList.add("img-container");
	listContainerElem.classList.add("list-container");
	storyWrapperElem.classList.add("story-container");
};

app.setTextContent = (
	storyData,
	sentimentData,
	titleElem,
	textElem,
	agreementListItem,
	ironyListItem,
	subjectivityListItem
) => {
	titleElem.textContent = `${storyData.title} by ${storyData.by}`;
	textElem.textContent = "Overall user sentiment:";
	agreementListItem.textContent = sentimentData.agreement;
	ironyListItem.textContent = sentimentData.irony;
	subjectivityListItem.textContent = sentimentData.subjectivity;
};

app.setAttributes = (imgElem, commentElem) => {
	imgElem.setAttribute("src", "./assets/luca-bravo-XJXWbfSo2f0-unsplash.jpg");
	imgElem.setAttribute("alt", "a generic computer-themed picture");
	commentElem.setAttribute("id", `comment-sentiment`);
};

app.updateIcons = (
	sentimentData,
	agreementIcon,
	ironyIcon,
	subjectivityIcon
) => {
	app.updateIcon(agreementIcon, sentimentData.agreement);
	app.updateIcon(ironyIcon, sentimentData.irony);
	app.updateIcon(subjectivityIcon, sentimentData.subjectivity);
};

app.prependIcons = (
	agreementListItem,
	ironyListItem,
	subjectivityListItem,
	agreementIcon,
	ironyIcon,
	subjectivityIcon
) => {
	agreementListItem.prepend(agreementIcon);
	ironyListItem.prepend(ironyIcon);
	subjectivityListItem.prepend(subjectivityIcon);
};

app.displayResults = (storyData, sentimentData) => {
	// target results container
	const resultsElem = document.querySelector("#results-container");

	// create unordered list
	const commentElem = document.createElement("ul");

	// create list items
	const agreementListItem = document.createElement("li");
	const ironyListItem = document.createElement("li");
	const subjectivityListItem = document.createElement("li");
	const linkListItem = document.createElement("li");

	// create link
	const linkElem = document.createElement("a");

	// create icons
	const agreementIcon = document.createElement("i");
	const ironyIcon = document.createElement("i");
	const subjectivityIcon = document.createElement("i");
	const caretIcon = document.createElement("i");

	// create element for article image
	const imgElem = document.createElement("img");

	// create headings
	const titleElem = document.createElement("h3");
	const textElem = document.createElement("h4");

	// create containers
	const titleContainerElem = document.createElement("div");
	const sentimentElem = document.createElement("div");
	const imgListContainerElem = document.createElement("div");
	const imgContainerElem = document.createElement("div");
	const listContainerElem = document.createElement("div");
	const storyWrapperElem = document.createElement("div");

	// set attributes
	app.setAttributes(imgElem, commentElem);

	// add classes to elements for styling
	app.addClasses(
		titleElem,
		titleContainerElem,
		sentimentElem,
		imgListContainerElem,
		imgContainerElem,
		listContainerElem,
		storyWrapperElem
	);

	// set text content on elements
	app.setTextContent(
		storyData,
		sentimentData,
		titleElem,
		textElem,
		agreementListItem,
		ironyListItem,
		subjectivityListItem
	);

	// set up story link
	app.setupStoryLink(linkElem, storyData, linkListItem, caretIcon);

	// update icon based on sentiment result
	app.updateIcons(sentimentData, agreementIcon, ironyIcon, subjectivityIcon);

	// prepend icon to list item
	app.prependIcons(
		agreementListItem,
		ironyListItem,
		subjectivityListItem,
		agreementIcon,
		ironyIcon,
		subjectivityIcon
	);

	// append comment sentiment to DOM
	app.appendSentiment(
		commentElem,
		agreementListItem,
		ironyListItem,
		subjectivityListItem,
		linkListItem
	);

	// build story and append to DOM
	app.buildStoryContainer(
		sentimentElem,
		textElem,
		imgListContainerElem,
		imgContainerElem,
		listContainerElem,
		imgElem,
		commentElem,
		storyWrapperElem,
		titleContainerElem,
		titleElem,
		resultsElem
	);

	// slowly scroll to top of results section
	app.useSmoothScrollEffect();
};

app.analyzeSentiment = async (storyData, commentText) => {
	// query for comment sentiment
	const res = await fetch(
		app.useProxy(app.sentimentUrl, "sentimentAnalyzer", commentText)
	);
	const sentimentData = await res.json();

	// display in the DOM
	app.displayResults(storyData, sentimentData);
};

app.getComments = async (storyData, storyId) => {
	// grab the first comment from story
	const commentId = storyData.kids[0];
	const commentUrl = `${app.itemUrl}${commentId}.json`;

	// query for comment data
	const res = await fetch(app.useProxy(commentUrl, "hackerNews"));
	const commentData = await res.json();

	// analyze comment text
	app.analyzeSentiment(storyData, commentData.text, storyId);
};

app.getNextStory = () => {
	// shift the position of the story array
	const newArrEndPosition = app.prevArrEndPosition + 1;
	app.getTopStories(app.prevArrEndPosition, newArrEndPosition);

	// update previous array end position
	app.prevArrEndPosition = newArrEndPosition;
};

// get top stories headlines
app.getStoryData = async (storyId) => {
	// build story url with story id
	const storyUrl = `${app.itemUrl}${storyId}.json`;

	// query for story details
	const res = await fetch(app.useProxy(storyUrl, "hackerNews"));
	const storyData = await res.json();

	// check if story has comments
	if (storyData.kids) {
		app.getComments(storyData, storyId);
	} else {
		// requery for another story with comment
		app.getNextStory();
	}
};

app.getTopStories = async (startPosition, articlesInput) => {
	// query for full 500 item list of top stories
	const res = await fetch(app.useProxy(app.topStoriesUrl, "hackerNews"));
	const articlesArr = await res.json();
	// trim articles array to match user selected results
	const articlesShortArr = articlesArr.slice(startPosition, articlesInput);
	articlesShortArr.forEach((storyId, i) => {
		setTimeout(() => {
			// loop over articles array to get story details by Id
			app.getStoryData(storyId);
		}, i * 1000);
	});
};

app.validateInputs = (articleInput) => {
	//check to make sure user selected a value for both dropdowns
	return articleInput ? true : false;
};

app.clearResults = () => {
	// target results container
	const storiesContainerElem = document.querySelectorAll(".story-container");
	// loop over nodelist of results containers
	storiesContainerElem.forEach((storyElem) => {
		storyElem.remove();
	});
};

app.setupForm = (event) => {
	// prevent refresh
	event.preventDefault();

	// clear the results
	app.clearResults();

	// set up event listener on "show more" button to display more results
	app.showMoreButtonEl.addEventListener("click", app.showMoreStories);

	// get user input from form
	const articlesInput = document.querySelector("#articles").value;

	// validate user input, if it passes, proceed
	if (app.validateInputs(articlesInput)) {
		// feed user inputs into Hacker News query
		app.getTopStories(0, articlesInput);
		// update the previous array end position
		app.prevArrEndPosition = parseInt(articlesInput);
	} else {
		alert("Please enter a preference");
	}
};

app.showMoreStories = () => {
	// get the #stories preference
	const articlesInput = document.querySelector("#articles").value;

	// validate user input, if it passes, proceed
	if (app.validateInputs(articlesInput)) {
		// calculate new end position
		const newArrEndPosition =
			app.prevArrEndPosition + parseInt(articlesInput);

		// get stories and shift the array position
		app.getTopStories(app.prevArrEndPosition, newArrEndPosition);

		// update the previous array end position
		app.prevArrEndPosition = newArrEndPosition;
	} else {
		alert("Please enter a preference");
	}
};

app.scrollToTop = () => {
	// scrolls to top of page
	window.scrollTo(0, 0);
};

app.init = () => {
	// attach event listener to form submit
	app.formEl.addEventListener("submit", app.setupForm);
	// attach listeners to change preference button
	app.changeButtonEl.addEventListener("click", app.scrollToTop);
};

app.init();
