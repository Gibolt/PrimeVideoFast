
let activeCard = null
const fetchingHash = {}

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
const TOP_IMAGE_WRAPPER_CLASS = "tst-packshot-link" // Video grid element on landing page
const GRID_ITEM_WRAPPER_CLASS = "dvui-beardContainer" // Video grid element on secondary pages
const GRID_ITEM_TITLE_CLASS = "av-beard-title-link" // Video grid title on secondary pages

// Extension UI Constants
const METACRITIC_CLASS = "custom-hover-metacritic-rating"
const IMDB_CLASS = "custom-hover-imdb-rating"
const ROTTEN_TOMATOES_CLASS = "custom-hover-rotten-tomatoes-rating"
const RATINGS_CLASS = "custom-hover-ratings"
const SCORE_SPAN_OVERLAY_CLASS = "custom-score-span-overlay"

// Service Logo Constants
const RT_IMAGE = getImage("rotten_tomatoes_favicon.jpg")
const MC_IMAGE = getImage("metacritic_favicon.webp")
const IMDB_IMAGE = getImage("imdb_favicon.webp")
const IMAGE_SIZE = "13px"
const IMPORTANT = " !important"
const NO_VALUE = "-"

// String cleanup general
const SUFFIX_4KUHD = "(4K UHD)"
const SUFFIX_4kUHD = "(4k UHD)"
const SUFFIX_4K = "(4K)"
const SUFFIX_4k = "(4k)"
const SUFFIX_ULTRA_HD = "[Ultra HD]"
const SUFFIX_SD_HD = "[HD/SD ver]"
const SUFFIX_EXTENDED_CUT = "(Extended Cut)"
const SUFFIX_UNCENSORED = "(Uncensored)"
const SUFFIX_EXTENDED_EDITION_DASH = "- Extended Edition"
const SUFFIX_EXTENDED_EDITION = "Extended Edition"
const SUFFIX_BONUS_FEATURE = "(Plus Bonus Feature)"
const SUFFIX_SILENT = "(Silent)"
const SUFFIX_FEATURE = "(Feature)"
const SUFFIX_ENGLISH_SUBTITLED = "(English Subtitled)"
const SUFFIX_CHINESE_LANGUAGE = "(Chinese Language)"
const SUFFIX_ENGLISH_LANGUAGE = "(English Language)"
const SUFFIX_FRENCH_LANGUAGE = "(French Language)"
const SUFFIX_ITALIAN_LANGUAGE = "(Italian Language)"
const SUFFIX_KOREAN_LANGUAGE = "(Korean Language)"
const SUFFIX_JAPANESE_LANGUAGE = "(Japanese Language)"
const SUFFIX_SPANISH_LANGUAGE = "(Spanish Language)"
const SUFFIX_ENGLISH = "(English)"
const SUFFIX_CHINESE = "(Chinese)"
const SUFFIX_FRENCH = "(French)"
const SUFFIX_ITALIAN = "(Italian)"
const SUFFIX_KOREAN = "(Korean)"
const SUFFIX_JAPANESE = "(Japanese)"
const SUFFIX_SPANISH = "(Spanish)"
const NA = "N/A"

// String cleanup names
const SUFFIX_UK = "(UK)"
const PREFIX_MARVEL = "Marvel's"
const PREFIX_JOHN_GRISHAM = "John Grisham's"
const PREFIX_TYLER_PERRY = "Tyler Perry's"
const PREFIX_ANTHONY_BOURDAIN = "Anthony Bourdain"

// String cleanup regex
const SERIES_REGEX = /[\s-,:]*(Season|Series|Volume|Vol|SEASON|SERIES|VOLUME|VOL)\s+([0-9]|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen)+/
const SERIES_NAME_REGEX = /[\s-,:]*(The|\s|Complete)*(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth)+\s+(Season|Series)/
const SEASON_EPISODE_REGEX = /[\s-]+S[0-9]+\s+E[0-9]+/
const EPISODE_REGEX = /[\s-]+Episode\s+[0-9]+/
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

function getAllCards() {
	return document.getElementsByClassName(HOVER_CARD_CLASS)
}

function getActiveCard() {
	const cards = getAllCards()
	for (const card of cards) {
		if (isVisible(getTitleNode(card))) return card
	}
	return null
}

const getRatingSpanClass = (hashKey) => {
	const videoKey = hashKey.replaceAll(/\s/g, "-").replaceAll(/[^_a-zA-Z0-9-]/g, "")
	return `${RATINGS_CLASS}-${videoKey}`
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

function getTopImageWrapperDiv(card) {
	return findByClass(card, TOP_IMAGE_WRAPPER_CLASS)
}


function getGridItemWrapperDiv(card) {
	return findByClass(card, GRID_ITEM_WRAPPER_CLASS)
}

function getInnerVideoDetailDiv(card) {
	return getReviewNode(card)?.parentElement?.parentElement?.parentElement
		?? getMaturityRatingNode(card)?.parentElement?.parentElement
		?? getSubtitleIndicatorNode(card)?.parentElement?.parentElement
		?? null
}

function getTitle(card) {
	const title = getTitleNode(card)?.innerText
	if (!title) return

	return cleanTitle(title)
}

function cleanTitle(title) {
	return title
		.replace(SERIES_REGEX, "")
		.replace(SERIES_NAME_REGEX, "")
		.replace(EPISODE_REGEX, "")
		.replace(YEAR_REGEX, "")
		.replace(SERIES_NAME_REGEX, "")
		.replace(SUFFIX_4KUHD, "")
		.replace(SUFFIX_4kUHD, "")
		.replace(SUFFIX_4K, "")
		.replace(SUFFIX_4k, "")
		.replace(SUFFIX_ULTRA_HD, "")
		.replace(SUFFIX_SD_HD, "")
		.replace(SUFFIX_EXTENDED_CUT, "")
		.replace(SUFFIX_UNCENSORED, "")
		.replace(SUFFIX_EXTENDED_EDITION_DASH, "")
		.replace(SUFFIX_EXTENDED_EDITION, "")
		.replace(SUFFIX_BONUS_FEATURE, "")
		.replace(SUFFIX_SILENT, "")
		.replace(SUFFIX_FEATURE, "")
		.replace(SUFFIX_ENGLISH_SUBTITLED, "")
		.replace(SUFFIX_CHINESE_LANGUAGE, "")
		.replace(SUFFIX_ENGLISH_LANGUAGE, "")
		.replace(SUFFIX_FRENCH_LANGUAGE, "")
		.replace(SUFFIX_ITALIAN_LANGUAGE, "")
		.replace(SUFFIX_KOREAN_LANGUAGE, "")
		.replace(SUFFIX_JAPANESE_LANGUAGE, "")
		.replace(SUFFIX_SPANISH_LANGUAGE, "")
		.replace(SUFFIX_ENGLISH, "")
		.replace(SUFFIX_CHINESE, "")
		.replace(SUFFIX_FRENCH, "")
		.replace(SUFFIX_ITALIAN, "")
		.replace(SUFFIX_KOREAN, "")
		.replace(SUFFIX_JAPANESE, "")
		.replace(SUFFIX_SPANISH, "")
		.replace(SUFFIX_UK, "")
		.replace(PREFIX_MARVEL, "")
		.replace(PREFIX_JOHN_GRISHAM, "")
		.replace(PREFIX_TYLER_PERRY, "")
		.replace(PREFIX_ANTHONY_BOURDAIN, "")
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

function isCtaForSeries(cta) {
	return EPISODE_REGEX.test(cta) || SEASON_EPISODE_REGEX.test(cta)
}

function isTvSeries(card) {
	const title = getTitleNode(card)?.innerText
	if (SERIES_REGEX.test(title)) return true
	if (SERIES_NAME_REGEX.test(title)) return true
	if (EPISODE_REGEX.test(title)) return true

	if (hasSeasonNode(card)) return true

	const cta = getPlayButtonNode(card)?.parentNode?.innerText ?? ""
	return isCtaForSeries(cta)
}

function getShowType(card) {
	return isTvSeries(card) ? TYPE_SERIES : TYPE_MOVIE
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

	const year = getYear(card)
	const type = getShowType(card)
	const hashKey = videoHashKey(title, year, type)

	if (fetchingHash[hashKey]) return

	const cachedRatings = getRatings(hashKey)
	if (cachedRatings) {
		renderRating(card, cachedRatings, hashKey)
		return
	}

	// Prevent multiple queries for same title
	fetchingHash[hashKey] = true

	const params = {
		apikey,
		t: title,
		// ...(year && !isSeries && {y: year}), // year is unreliable
		type,
		tomatoes: true
	}

	fetchOmdbResult(params, json => {
		fetchingHash[hashKey] = false
		log("Request made with params", params)
		log("Request made with JSON response", json)

		// const error = json.Error
		// if (error === NO_MOVIE_ERROR || error === NO_SERIES_ERROR) return

		const ratings = dataToScores(json, year)
		storeRatings(ratings, hashKey)
		renderRating(card, ratings, hashKey)
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

function dataToScores(data = {}, year) {
	return {
		title: data.Title,
		year: data.Year ?? year,
		type: data.Type,
		metacritic : cleanScore(data.Metascore),
		imdb : cleanScore(data.imdbRating),
		rottenTomatoes : cleanScore(getRottenTomatoesRating(data)),
		fetchTime : Date.now()
	}
}

function renderRating(card, ratings, hashKey) {
	if (!card || !ratings) return

	log(`Rendering on card: ${card}`)

	const innerDetailDiv = getInnerVideoDetailDiv(card)
	const outerDetailDiv = getOuterVideoDetailDiv(card)
	const topImageWrapperDiv = getTopImageWrapperDiv(card)

	addScoreSpan(innerDetailDiv, ratings, hashKey)
	addScoreSpan(outerDetailDiv, ratings, hashKey)
	if (!outerDetailDiv) addScoreSpan(topImageWrapperDiv, ratings, hashKey, true)
}

function createScoreSpan({metacritic, imdb, rottenTomatoes} = {}, hashKey) {
	const ratingsContainer = html.toElement(RATINGS_HTML)
	ratingsContainer.querySelector(`.${ROTTEN_TOMATOES_CLASS}`).innerText = rottenTomatoes
	ratingsContainer.querySelector(`.${METACRITIC_CLASS}`).innerText = metacritic
	ratingsContainer.querySelector(`.${IMDB_CLASS}`).innerText = imdb
	const ratingsSpan = ratingsContainer?.querySelector(`.${RATINGS_CLASS}`)
	ratingsSpan?.classList?.add(getRatingSpanClass(hashKey))
	ratingsSpan.addEventListener('click', () => {
		clearRatings(hashKey)
		document.querySelectorAll(`.${getRatingSpanClass(hashKey)}`).forEach(span => span?.remove())
	});
	return ratingsContainer
}

function addScoreSpan(parent, ratings, hashKey, isOverlay = false) {
	if (parent?.querySelector(`.${RATINGS_CLASS}`) !== null) return

	maybeRemoveImdbSpan(parent)
	const scoreSpan = createScoreSpan(ratings, hashKey)
	if (!isOverlay) parent?.prepend(scoreSpan)
	else {
		alterScoreSpanForOverlay(scoreSpan)
		parent?.append(scoreSpan)
	}
}

function alterScoreSpanForOverlay(span) {
	const ratings = span?.querySelector(`.${RATINGS_CLASS}`)
	ratings?.classList?.add(SCORE_SPAN_OVERLAY_CLASS)
	return span
}

function maybeFetchRatings() {
	const card = getActiveCard()
	if (card === activeCard) return

	log(`New active card: `, card, ` -> ${getTitle(card)}`)
	activeCard = card

	storage.load(() => fetchRatings(card))

//	ratingsHash[TEST_TITLE] = TEST_DATA
//	renderRating(TEST_TITLE)
}

function storeRatings(omdbApiRatings, hashKey) {
	if (!omdbApiRatings) return

	const hash = settings.get(Setting.OmdbResultsHash)
	hash[hashKey] = omdbApiRatings
	settings.set(Setting.OmdbResultsHash, hash)
}

function clearRatings(hashKey) {
	const hash = settings.get(Setting.OmdbResultsHash)
	if (!hash[hashKey]) return
	console.log('deleting key', hashKey, hash)
	console.log(hash[hashKey]);
	delete hash[hashKey];
	console.log('after', hash[hashKey]);
	settings.set(Setting.OmdbResultsHash, hash)
}

function getRatings(hashKey) {
	return settings.get(Setting.OmdbResultsHash)?.[hashKey]
}

function videoHashKey(title = "", year = "", type) {
	log("hashKey: ", `${title}|${year}|${type}`)
	if (!title || !type) return null
	return `${title}|${year}|${type}`
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

const getUnopenedCards = () => {

}

// TODO: Repeat this every 20 seconds to get paginated cards
const renderInitialRatings = () => {
	log("renderInitialRatings---")
	renderInitialRatingsLandingPage()
	renderInitialRatingsSecondaryPage()
}

const renderInitialRatingsLandingPage = () => {
	const innerCards = document.getElementsByClassName(TOP_IMAGE_WRAPPER_CLASS)
	const hashKeys = Object.keys(settings.get(Setting.OmdbResultsHash))
	for (const card of innerCards) {
		const ariaTitle = card?.firstElementChild?.ariaLabel
		if (!ariaTitle) continue

		const title = cleanTitle(ariaTitle)
		if (!title) continue

		const matchingKey = hashKeys.find(key => key.startsWith(`${title}|`))
		if (!matchingKey) continue
		log("Adding scores for: ", title, "->", ariaTitle)

		const ratings = getRatings(matchingKey)
		const scoreSpan = createScoreSpan(ratings, matchingKey)
		alterScoreSpanForOverlay(scoreSpan)
		card?.append(scoreSpan)
	}
}

const renderInitialRatingsSecondaryPage = () => {
	const gridCards = document.getElementsByClassName(GRID_ITEM_WRAPPER_CLASS)
	const hashKeys = Object.keys(settings.get(Setting.OmdbResultsHash))
	for (const card of gridCards) {
		const dirtyTitle = card?.querySelector(`.${GRID_ITEM_TITLE_CLASS}`)?.innerText
		if (!dirtyTitle) continue

		const title = cleanTitle(dirtyTitle)
		if (!title) continue

		const matchingKey = hashKeys.find(key => key.startsWith(`${title}|`))
		if (!matchingKey) continue
		log("Adding scores for: ", title, "->", dirtyTitle)

		const ratings = getRatings(matchingKey)
		renderRating(card, ratings)
	}
}

runRatingsCheckRepeatedly()
storage.load(() => setTimeout(renderInitialRatings, 2000))

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

// Currently must be run from the console
// TODO: Find a better home for unit tests
const runAllTests = () => {
	testTitleCleanup()
	testSeriesTypeCheck()
}

const testTitleCleanup = () => {
	for (const [originalTitle, expectedTitle] of Object.entries(TEST_TITLE_CASES)) {
		const cleanedTitle = cleanTitle(originalTitle)
		if (cleanedTitle !== expectedTitle)
			console.error(`Expected clean title\n  "${expectedTitle}" but was \n  "${cleanedTitle}" for\n  "${originalTitle}"`)
	}
}

const testSeriesTypeCheck = () => {
	for (const [cta, isSeriesExpected] of Object.entries(TEST_SERIES_CHECK_CASES)) {
		const isSeries = isCtaForSeries(cta)
		if (isSeries !== isSeriesExpected)
			console.error(`Expected series for "${cta}" to be ${isSeriesExpected}`)
	}
}

// Cases to check that title cleanup is working reliably
const TEST_TITLE_CASES = {
	"Warehouse 13 Season 1" : "Warehouse 13",
	"Schitt's Creek Season 1 (Uncensored)" : "Schitt's Creek",
	"Nikita: The Complete First Season" : "Nikita",
	"The Rockford Files, Season 1" : "The Rockford Files",
	"Desperate Housewives Season 8" : "Desperate Housewives",
	"Heroes Volume 1" : "Heroes",
	"Sherlock Holmes (2009)" : "Sherlock Holmes",
	"Murder, She Wrote - Season 1" : "Murder, She Wrote",
	"Sneaky Pete - Season 2 (4K UHD)" : "Sneaky Pete",
	"Uncut Gems (4k UHD)" : "Uncut Gems",
	"Dennis The Menace, Season One" : "Dennis The Menace",
	"Marvel's Avengers [Ultra HD]" : "Avengers",
	"Anthony Bourdain A Cook's Tour" : "A Cook's Tour",
	"Tyler Perry's Acrimony" : "Acrimony",
	"Top Gear Season 14 (UK)" : "Top Gear",
	"Rambo: Last Blood (Extended Cut)" : "Rambo: Last Blood",
	"Twilight - Extended Edition" : "Twilight",
	"The Tale of The Princess Kaguya (Japanese Language)" : "The Tale of The Princess Kaguya",
	"The Complete Metropolis (Silent)" : "The Complete Metropolis",
}

// Cases to handle with title cleanup that don't have an obvious solution
const UNHANDLED_TITLE_CASES = {
	"Pop Team Epic (Original Japanese Version)" : "Pop Team Epic",
}

// Cases to check that CTA regex can reliably determine show type
const TEST_SERIES_CHECK_CASES = {
	"Play" : false,
	"Play S1 E3" : true,
	"Play S10 E15" : true,
	"Play Episode 1" : true,
	"Play Episode 10" : true,
	"Play S101 E1" : true,
}
