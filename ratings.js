
let activeCard = null
const ratingsHash = {}

// API Constants
const MOVIE_API_DOMAIN = "https://www.omdbapi.com/"
const NO_MOVIE_ERROR = "Movie not found!"
const NO_SERIES_ERROR = "Series not found!"
const TYPE_MOVIE = "movie"
const TYPE_SERIES = "series"
const ROTTEN_TOMATO_API_SOURCE = "Rotten Tomatoes"

// Amazon UI Constants
const HOVER_CARD_CLASS = "tst-hover-container"
const TITLE_CLASS = "tst-hover-title"
const REVIEWS_CLASS = "tst-hover-customer-reviews"

// Extension UI Constants
const METACRITIC_CLASS = "custom-hover-metacritic-rating"
const IMDB_CLASS = "custom-hover-imdb-rating"
const ROTTEN_TOMATOES_CLASS = "custom-hover-rotten-tomatoes-rating"
const RATINGS_CLASS = "custom-hover-ratings"

// Service Logo Constants
const RT_IMAGE = chrome.extension.getURL("img/rotten_tomatoes_favicon.jpg")
const MC_IMAGE = chrome.extension.getURL("img/metacritic_favicon.png")
const IMDB_IMAGE = chrome.extension.getURL("img/imdb_favicon.webp")
const IMAGE_SIZE = 13
const NO_VALUE = "-"

// String cleanup
const SUFFIX_4K = "(4K UHD)"
const NA = "N/A"
const SERIES_REGEX = /[\s-]+Season\s+[0-9]+/
const YEAR_REGEX = /\s+\(([0-9]{4})\)/

function isHidden(node) {
	return node.offsetParent === null
}

function isVisible(node) {
	return !isHidden(node)
}

function isYear(text) {
	if (!text) return false
	const cleanText = text.trim()

	if (cleanText.length !== 4) return false
	return !isNaN(cleanText)
}

function getActiveCard() {
	var cards = document.getElementsByClassName(HOVER_CARD_CLASS)
	for (const card of cards) {
		if (isVisible(getTitleNode(card))) return card
	}
	return null
}

function getReviewNode(card) {
	return card?.querySelector(`.${REVIEWS_CLASS}`) || null
}

function getTitle(card) {
	let title = getTitleNode(card)?.innerText
	if (!title) return

	if (YEAR_REGEX.test(title) && title.match(YEAR_REGEX)[1] === getYear(card)) {
		title = title.replace(YEAR_REGEX, "").trim()
	}
	return title.replace(SUFFIX_4K, "")
}

function getSeriesTitle(rawTitle) {
	const title = rawTitle.replace(SERIES_REGEX, "")?.trim() ?? ""
	log(`Cleaned Series title "${title}" from "${rawTitle}"`)
	return title
}

function getTitleNode(card) {
	return card?.querySelector(`.${TITLE_CLASS}`) || null
}

function getYear(card) {
	return getYearNode(card)?.innerText || null
}

function getYearNode(card) {
	const nextElement = getReviewNode(card)?.parentElement?.parentElement?.nextElementSibling
	return getYearNodeRecursive(nextElement)
}

function getYearNodeRecursive(sibling) {
	if (!sibling) return null

	const nodeText = sibling?.innerText
	if (isYear(nodeText)) return sibling
	return getYearNodeRecursive(sibling.nextElementSibling)
}

function isTvSeries(card) {
	const title = getTitle(card)
	if (SERIES_REGEX.test(title)) return true
	return false
}

function cleanScore(score) {
	return (!score || score === NA) ? NO_VALUE : score
}

function fetchRatings(card) {
	const title = getTitle(card)
	if (!title) return

	const apikey = settings.get(Setting.OmdbApiKey)
	if (!apikey) return

	const existingData = ratingsHash[title]
	if (existingData !== undefined) {
		if (existingData != null) renderRating(title)
		return
	}
	// Prevent multiple queries for same title
	ratingsHash[title] = null

	const year = getYear(card)
	const type = isTvSeries(card) ? TYPE_SERIES : TYPE_MOVIE
	const realTitle = (type === TYPE_SERIES) ? getSeriesTitle(title) : title

	const params = {
		apikey,
		t: realTitle,
		...(year && {y: year}),
		type,
		tomatoes: true
	}

	urlWithParams(MOVIE_API_DOMAIN, params)
		.fetch()
		.then(data => data.json())
		.then(json => {
			ratingsHash[title] = json
			log('Request made with JSON response', json)

			const error = json.Error
			// if (error === NO_MOVIE_ERROR || error === NO_SERIES_ERROR) return

			renderRating(title)
		}).catch(function (error) {
			log('request failed', error)
		})
}

function getRottenTomatoesRating(json) {
	return json?.Ratings?.find(score => score.Source === ROTTEN_TOMATO_API_SOURCE)?.Value || null
}

function urlWithParams(uri, params = {}) {
	const url = new URL(uri)
	url.search = new URLSearchParams(params).toString()
	return {
		fetch: () => { return fetch(url) }
	}
}

function renderRating(title) {
	const ratings = ratingsHash[title]
	log(`Rendering rating: ${ratings}`)
	if (!ratings) return

	const card = getActiveCard()
	log(`Rendering on card: ${card}`)
	if (card !== activeCard) return
	if (card?.querySelector(`.${RATINGS_CLASS}`)) return

	const reviewNode = getReviewNode(card)?.parentElement?.parentElement
	log(reviewNode)
	if (!reviewNode) return

	const metacritic = cleanScore(ratings.Metascore)
	const imdb = cleanScore(ratings.imdbRating)
	const rottenTomatoes = cleanScore(getRottenTomatoesRating(ratings))

	log(`metacritic: ${metacritic}  imdb: ${imdb}  rottenTomatoes: ${rottenTomatoes}`)

	const shellContainer = document.createElement('div')
	reviewNode.after(shellContainer)
	shellContainer.outerHTML = RATINGS_HTML
	const ratingsContainer = card.querySelector(`.${RATINGS_CLASS}`)
	log(ratingsContainer)
	ratingsContainer.querySelector(`.${ROTTEN_TOMATOES_CLASS}`).innerText = rottenTomatoes
	ratingsContainer.querySelector(`.${METACRITIC_CLASS}`).innerText = metacritic
	ratingsContainer.querySelector(`.${IMDB_CLASS}`).innerText = imdb
}

function maybeFetchRatings() {
	const card = getActiveCard()
	if (card === activeCard) return

	log(`New active card: ${card} -> ${getTitle(card)}`)
	activeCard = card

	storage.load(() =>
		fetchRatings(card)
	)

//	ratingsHash[TEST_TITLE] = TEST_DATA
//	renderRating(TEST_TITLE)
}

const runRatingsCheckRepeatedly = function() {
	setInterval(() => {
		maybeFetchRatings()
	}, 750)
//	document.addEventListener('keydown', ({key}) => {
//		log(`event: ${key}`)
//		if (key === "Enter") maybeFetchRatings()
//	})
}

runRatingsCheckRepeatedly()

const RATINGS_HTML = `<span class="${RATINGS_CLASS}" style="">
		<img src="${RT_IMAGE}" width="${IMAGE_SIZE}" height="${IMAGE_SIZE}" style="vertical-align: middle"/>
		<span class="${ROTTEN_TOMATOES_CLASS}" style=""></span>
		<img src="${MC_IMAGE}" width="${IMAGE_SIZE}" height="${IMAGE_SIZE}" style="vertical-align: middle"/>
		<span class="${METACRITIC_CLASS}" style=""></span>
		<img src="${IMDB_IMAGE}" width="${IMAGE_SIZE}" height="${IMAGE_SIZE}" style="vertical-align: middle"/>
		<span class="${IMDB_CLASS}" style=""></span>
	</span>`

const TEST_TITLE = "Gone with the Wind"
const TEST_DATA = {"Title":"Gone with the Wind","Year":"1939","Rated":"Passed","Released":"17 Jan 1940","Runtime":"238 min","Genre":"Drama, History, Romance, War","Director":"Victor Fleming, George Cukor, Sam Wood","Writer":"Margaret Mitchell (story of the old south \"Gone with the Wind\"), Sidney Howard (screenplay)","Actors":"Thomas Mitchell, Barbara O'Neil, Vivien Leigh, Evelyn Keyes","Plot":"A manipulative woman and a roguish man conduct a turbulent romance during the American Civil War and Reconstruction periods.","Language":"English","Country":"USA","Awards":"Won 8 Oscars. Another 12 wins & 12 nominations.","Poster":"https://m.media-amazon.com/images/M/MV5BYjUyZWZkM2UtMzYxYy00ZmQ3LWFmZTQtOGE2YjBkNjA3YWZlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg","Ratings":[{"Source":"Internet Movie Database","Value":"8.1/10"},{"Source":"Rotten Tomatoes","Value":"91%"},{"Source":"Metacritic","Value":"97/100"}],"Metascore":"97","imdbRating":"8.1","imdbVotes":"280,849","imdbID":"tt0031381","Type":"movie","tomatoMeter":"N/A","tomatoImage":"N/A","tomatoRating":"N/A","tomatoReviews":"N/A","tomatoFresh":"N/A","tomatoRotten":"N/A","tomatoConsensus":"N/A","tomatoUserMeter":"N/A","tomatoUserRating":"N/A","tomatoUserReviews":"N/A","tomatoURL":"http://www.rottentomatoes.com/m/gone_with_the_wind/","DVD":"07 Mar 2000","BoxOffice":"N/A","Production":"Loew&#39;s Inc.","Website":"N/A","Response":"True"}