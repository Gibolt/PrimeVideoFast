
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
const MATURITY_RATING_CLASS = "tst-hover-maturity-rating"
const SUBTITLE_INDICATOR_CLASS = "tst-hover-subtitles"
const PLAY_BUTTON_CLASS = "tst-play-button"
const OUTER_CARD_DETAIL_CLASS = "dv-grid-beard-info"

// Extension UI Constants
const METACRITIC_CLASS = "custom-hover-metacritic-rating"
const IMDB_CLASS = "custom-hover-imdb-rating"
const ROTTEN_TOMATOES_CLASS = "custom-hover-rotten-tomatoes-rating"
const RATINGS_CLASS = "custom-hover-ratings"

// Service Logo Constants
const RT_IMAGE = chrome.extension.getURL("img/rotten_tomatoes_favicon.jpg")
const MC_IMAGE = chrome.extension.getURL("img/metacritic_favicon.png")
const IMDB_IMAGE = chrome.extension.getURL("img/imdb_favicon.webp")
const IMAGE_SIZE = "13px"
const IMPORTANT = " !important"
const NO_VALUE = "-"

// String cleanup
const SUFFIX_4K = "(4K UHD)"
const SUFFIX_ULTRA_HD = "[Ultra HD]"
const SUFFIX_EXTENDED_CUT = "(Extended Cut)"
const SUFFIX_EXTENDED_EDITION_DASH = "- Extended Edition"
const SUFFIX_EXTENDED_EDITION = "Extended Edition"
const SUFFIX_BONUS_FEATURE = "(Plus Bonus Feature)"
const PREFIX_MARVEL = "Marvel's"
const PREFIX_JOHN_GRISHAM = "John Grisham's"
const PREFIX_TYLER_PERRY = "Tyler Perry's"
const NA = "N/A"
const SERIES_REGEX = /[\s-,:]*Season\s+[0-9]+/
const EPISODE_REGEX = /[\s-]+S[0-9]+\s+E[0-9]+/
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
	const cards = document.getElementsByClassName(HOVER_CARD_CLASS)
	for (const card of cards) {
		if (isVisible(getTitleNode(card))) return card
	}
	return null
}

function findByClass(parent, className) {
	return parent?.querySelector(`.${className}`) || null
}

function getReviewNode(card) {
	return findByClass(card, REVIEWS_CLASS)
}

function getMaturityRatingNode(card) {
	return findByClass(card, MATURITY_RATING_CLASS)
}

function getSubtitleIndicatorNode(card) {
	return findByClass(card, SUBTITLE_INDICATOR_CLASS)
}

function getPlayButtonNode(card) {
	return findByClass(card, PLAY_BUTTON_CLASS)
}

function getOuterVideoDetailDiv(card) {
	return findByClass(card, OUTER_CARD_DETAIL_CLASS)
}

function getInnerVideoDetailDiv(card) {
	return getReviewNode(card)?.parentElement?.parentElement
		?? getMaturityRatingNode(card)?.parentElement?.parentElement
		?? getSubtitleIndicatorNode(card)?.parentElement?.parentElement
		?? null
}

function getTitle(card) {
	let title = getTitleNode(card)?.innerText
	if (!title) return

	if (YEAR_REGEX.test(title)) {
		const year = getYear(card)
		if (!year || title.match(YEAR_REGEX)[1] === year) {
			title = title.replace(YEAR_REGEX, "").trim()
		}
	}
	return title
		.replace(SUFFIX_4K, "")
		.replace(SUFFIX_ULTRA_HD, "")
		.replace(SUFFIX_EXTENDED_CUT, "")
		.replace(SUFFIX_EXTENDED_EDITION_DASH, "")
		.replace(SUFFIX_EXTENDED_EDITION, "")
		.replace(SUFFIX_BONUS_FEATURE, "")
		.replace(PREFIX_MARVEL, "")
		.replace(PREFIX_JOHN_GRISHAM, "")
		.replace(PREFIX_TYLER_PERRY, "")
		.trim()
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
	const children = getInnerVideoDetailDiv(card)?.children ?? []
	for (const child of children) {
		const nodeText = child?.innerText
		if (isYear(nodeText)) return child
	}
	return null
}

function hasSeasonNode(card) {
	const children = getOuterVideoDetailDiv(card)?.children ?? []
	for (const child of children) {
		const nodeText = child?.innerText ?? ""
		if (SERIES_REGEX.test(nodeText)) return child
	}
	return null
}

function isTvSeries(card) {
	const title = getTitle(card)
	if (SERIES_REGEX.test(title)) return true

	if (hasSeasonNode(card)) return true

	const playText = getPlayButtonNode(card)?.parentNode?.innerText ?? ""
	return EPISODE_REGEX.test(playText)
}

function cleanScore(score) {
	return (!score || score === NA) ? NO_VALUE : score
}

function maybeRemoveImdbSpan(detailDiv) {
	if (!detailDiv) return
	for (const child of detailDiv.children) {
		if (child.innerText?.includes("IMDb")) {
			child.remove()
			return
		}
	}
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
	const isSeries = isTvSeries(card)
	const type = isSeries ? TYPE_SERIES : TYPE_MOVIE
	const realTitle = isSeries ? getSeriesTitle(title) : title

	const params = {
		apikey,
		t: realTitle,
		...(year && !isSeries && {y: year}),
		type,
		tomatoes: true
	}

	fetchOmdbResult(params, json => {
		ratingsHash[title] = json
		log("Request made with params", params)
		log("Request made with JSON response", json)

		// const error = json.Error
		// if (error === NO_MOVIE_ERROR || error === NO_SERIES_ERROR) return

		renderRating(title)
	})
}

function getRottenTomatoesRating(json) {
	return json?.Ratings?.find(score => score.Source === ROTTEN_TOMATO_API_SOURCE)?.Value || null
}

function fetchOmdbResult(params, callback) {
	urlWithParams(MOVIE_API_DOMAIN, params)
		.fetch()
		.then(data => data.json())
		.then(callback)
		.catch(function (error) {
			log("Request failed", error)
		})
}

function urlWithParams(uri, params = {}) {
	const url = new URL(uri)
	url.search = new URLSearchParams(params).toString()
	return {
		fetch: () => { return fetch(url) }
	}
}

function dataToScores(data = {}) {
	return {
		metacritic : cleanScore(data.Metascore),
		imdb : cleanScore(data.imdbRating),
		rottenTomatoes : cleanScore(getRottenTomatoesRating(data)),
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

	const scores = dataToScores(ratings)

	const innerDetailDiv = getInnerVideoDetailDiv(card)
	const outerDetailDiv = getOuterVideoDetailDiv(card)
	log(innerDetailDiv)
	log(outerDetailDiv)

	maybeRemoveImdbSpan(innerDetailDiv)
	maybeRemoveImdbSpan(outerDetailDiv)
	innerDetailDiv?.prepend(createScoreSpan(scores))
	outerDetailDiv?.prepend(createScoreSpan(scores))

}

function createScoreSpan({metacritic, imdb, rottenTomatoes} = {}) {
	const ratingsContainer = html.toElement(RATINGS_HTML)
	ratingsContainer.querySelector(`.${ROTTEN_TOMATOES_CLASS}`).innerText = rottenTomatoes
	ratingsContainer.querySelector(`.${METACRITIC_CLASS}`).innerText = metacritic
	ratingsContainer.querySelector(`.${IMDB_CLASS}`).innerText = imdb
	log(ratingsContainer)
	return ratingsContainer
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

const IMAGE_STYLE = `"vertical-align: middle; width:${IMAGE_SIZE}${IMPORTANT}; height:${IMAGE_SIZE}${IMPORTANT}"`
const RATINGS_HTML = `
	<span class="${RATINGS_CLASS}" style="font-size: ${IMAGE_SIZE} !important">
		<img src="${RT_IMAGE}" style=${IMAGE_STYLE} />
		<span class="${ROTTEN_TOMATOES_CLASS}" style=""></span>
		<img src="${MC_IMAGE}" style=${IMAGE_STYLE} />
		<span class="${METACRITIC_CLASS}" style=""></span>
		<img src="${IMDB_IMAGE}" style=${IMAGE_STYLE}/>
		<span class="${IMDB_CLASS}" style=""></span>
	</span>`

const TEST_TITLE = "Gone with the Wind"
const TEST_DATA = {"Title":"Gone with the Wind","Year":"1939","Rated":"Passed","Released":"17 Jan 1940","Runtime":"238 min","Genre":"Drama, History, Romance, War","Director":"Victor Fleming, George Cukor, Sam Wood","Writer":"Margaret Mitchell (story of the old south \"Gone with the Wind\"), Sidney Howard (screenplay)","Actors":"Thomas Mitchell, Barbara O'Neil, Vivien Leigh, Evelyn Keyes","Plot":"A manipulative woman and a roguish man conduct a turbulent romance during the American Civil War and Reconstruction periods.","Language":"English","Country":"USA","Awards":"Won 8 Oscars. Another 12 wins & 12 nominations.","Poster":"https://m.media-amazon.com/images/M/MV5BYjUyZWZkM2UtMzYxYy00ZmQ3LWFmZTQtOGE2YjBkNjA3YWZlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg","Ratings":[{"Source":"Internet Movie Database","Value":"8.1/10"},{"Source":"Rotten Tomatoes","Value":"91%"},{"Source":"Metacritic","Value":"97/100"}],"Metascore":"97","imdbRating":"8.1","imdbVotes":"280,849","imdbID":"tt0031381","Type":"movie","tomatoMeter":"N/A","tomatoImage":"N/A","tomatoRating":"N/A","tomatoReviews":"N/A","tomatoFresh":"N/A","tomatoRotten":"N/A","tomatoConsensus":"N/A","tomatoUserMeter":"N/A","tomatoUserRating":"N/A","tomatoUserReviews":"N/A","tomatoURL":"http://www.rottentomatoes.com/m/gone_with_the_wind/","DVD":"07 Mar 2000","BoxOffice":"N/A","Production":"Loew&#39;s Inc.","Website":"N/A","Response":"True"}
