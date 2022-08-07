
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
const CAPTIONS_CLASS = "atvwebplayersdk-captions-text" // Caption container
const LEAVING_PRIME_TEXT = "Leaving Prime on"

// Extension UI Constants
const METACRITIC_CLASS = "custom-hover-metacritic-rating"
const IMDB_CLASS = "custom-hover-imdb-rating"
const ROTTEN_TOMATOES_CLASS = "custom-hover-rotten-tomatoes-rating"
const DATE_WARNING_ICON_CLASS = "custom-hover-date-warning-icon"
const DATE_WARNING_CLASS = "custom-hover-date-warning"
const TROPHY_ICON_CLASS = "custom-hover-trophy-icon"
const TROPHY_CLASS = "custom-hover-trophy-count"
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
const SUFFIX_UNRATED = "(Unrated)"
const SUFFIX_EXTENDED_EDITION_DASH = "- Extended Edition"
const SUFFIX_EXTENDED_EDITION = "Extended Edition"
const SUFFIX_BONUS_FEATURE = "(Plus Bonus Feature)"
const SUFFIX_SILENT = "(Silent)"
const SUFFIX_SUBTITLES = "(Subtitles)"
const SUFFIX_SUBTITLED = "(Subtitled)"
const SUFFIX_IN_COLOR = "(In Color)"
const SUFFIX_FEATURE = "(Feature)"
const SUFFIX_THEATRICAL = "(Theatrical)"
const NA = "N/A"

const LANGUAGES = ['English', 'Chinese', 'French', 'Italian', 'Korean', 'Japanese', 'Spanish', 'Polish', 'Russian']
const LANGUAGE_SUFFIXES = LANGUAGES.reduce((all, language) => {
	all.push(...[
		language,
		`${language} Language`,
		`${language} Subtitled`,
		`${language} Subtitles`,
		`${language} Dub`,
		`${language} Dubbed`,
		`Original ${language} Version`,
	])
	return all
}, []).reduce((all, language) => {
	all.push(...[
		`- ${language}`,
		`[${language}]`,
		`(${language})`,
	])
	return all
}, [])

// String cleanup names
const SUFFIX_UK = "(UK)"
const PREFIX_MARVEL = "Marvel's"
const PREFIX_JOHN_GRISHAM = "John Grisham's"
const PREFIX_TYLER_PERRY = "Tyler Perry's"
const PREFIX_PHILIP_K_DICK = "Philip K. Dick's"
const PREFIX_ANTHONY_BOURDAIN = "Anthony Bourdain"

// String cleanup regex
const SERIES_REGEX = /[\s-,:]*(Season|Series|Volume|Vol|SEASON|SERIES|VOLUME|VOL)\s+([0-9]|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen)+/
const SERIES_NAME_REGEX = /[\s-,:]*(The|\s|Complete)*(Pilot|First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth|Thirteenth|Fourteenth|Fifteenth|Sixteenth|Seventeenth|Eighteenth|Nineteenth|Twentieth|Final|Last)+\s+(Season|Series)/
const SEASON_EPISODE_REGEX = /[\s-]+S[0-9]+\s+E[0-9]+/
const EPISODE_REGEX = /[\s-]+Episode\s+[0-9]+/
const YEAR_REGEX = /\s+\(([0-9]{4})\)/

const FREEVEE_INDICATOR = "Freevee — Free with ads"

const processedCards = new Set()

const isHidden = node => node.offsetParent === null
const isVisible = node => !isHidden(node)

const isYear = text => {
	if (!text) return false
	const cleanText = text.trim()

	if (cleanText.length !== 4) return false
	return !isNaN(cleanText)
}

const getAllCards = () => document.getElementsByClassName(HOVER_CARD_CLASS)

const getActiveCard = () => {
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

const findByClass = (parent, className) => parent?.querySelector(`.${className}`) ?? null

const getReviewNode = card => findByClass(card, REVIEWS_CLASS)
const getMaturityRatingNode = card => findByClass(card, MATURITY_RATING_CLASS)
const getSubtitleIndicatorNode = card => findByClass(card, SUBTITLE_INDICATOR_CLASS)
const getPlayButtonNode = card => findByClass(card, PLAY_BUTTON_CLASS)
const getOuterVideoDetailDiv = card => findByClass(card, OUTER_CARD_DETAIL_CLASS)
const getTopImageWrapperDiv = card => findByClass(card, TOP_IMAGE_WRAPPER_CLASS)

const getInnerVideoDetailDiv = card =>
	getReviewNode(card)?.parentElement?.parentElement?.parentElement
	?? getMaturityRatingNode(card)?.parentElement?.parentElement
	?? getSubtitleIndicatorNode(card)?.parentElement?.parentElement
	?? null

const getTitle = card => {
	const title = getTitleNode(card)?.innerText
	if (!title) return

	return cleanTitle(title)
}

const cleanTitle = (title) => {
	let cleanTitle = title
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
		.replace(SUFFIX_UNRATED, "")
		.replace(SUFFIX_EXTENDED_EDITION_DASH, "")
		.replace(SUFFIX_EXTENDED_EDITION, "")
		.replace(SUFFIX_BONUS_FEATURE, "")
		.replace(SUFFIX_SILENT, "")
		.replace(SUFFIX_SUBTITLES, "")
		.replace(SUFFIX_SUBTITLED, "")
		.replace(SUFFIX_IN_COLOR, "")
		.replace(SUFFIX_FEATURE, "")
		.replace(SUFFIX_THEATRICAL, "")
		.replace(SUFFIX_UK, "")
		.replace(PREFIX_MARVEL, "")
		.replace(PREFIX_JOHN_GRISHAM, "")
		.replace(PREFIX_TYLER_PERRY, "")
		.replace(PREFIX_PHILIP_K_DICK, "")
		.replace(PREFIX_ANTHONY_BOURDAIN, "")
	LANGUAGE_SUFFIXES.forEach(suffix => {
		cleanTitle = cleanTitle.replace(suffix, "")
	})
	return cleanTitle.trim()
}

const getSeriesTitle = rawTitle => {
	const title = rawTitle.replace(SERIES_REGEX, "")?.trim() ?? ""
	log(`Cleaned Series title "${title}" from "${rawTitle}"`)
	return title
}

const getTitleNode = (card) => card?.querySelector(`.${TITLE_CLASS}`) || null

const getYear = card => getYearNode(card)?.innerText || null

const getYearNode = (card) => {
	const children = getInnerVideoDetailDiv(card)?.children ?? []
	for (const child of children) {
		const nodeText = child?.innerText
		if (isYear(nodeText)) return child
	}
	return null
}

const hasSeasonNode = (card) => {
	const children = getOuterVideoDetailDiv(card)?.children ?? []
	for (const child of children) {
		const nodeText = child?.innerText ?? ""
		if (SERIES_REGEX.test(nodeText)) return child
	}
	return null
}

const isCtaForSeries = (cta) => {
	return EPISODE_REGEX.test(cta) || SEASON_EPISODE_REGEX.test(cta)
}

const isTvSeries = (card) => {
	const title = getTitleNode(card)?.innerText
	if (SERIES_REGEX.test(title)) return true
	if (SERIES_NAME_REGEX.test(title)) return true
	if (EPISODE_REGEX.test(title)) return true

	if (hasSeasonNode(card)) return true

	const cta = getPlayButtonNode(card)?.parentNode?.innerText ?? ""
	return isCtaForSeries(cta)
}

const cleanScore = (score) => {
	return (!score || score === NA) ? NO_VALUE : score
}

const maybeRemoveImdbSpan = (detailDiv) => {
	if (!detailDiv) return
	for (const child of detailDiv.children) {
		if (child.innerText?.includes("IMDb")) {
			child.remove()
			return
		}
	}
}

const maybeRemoveFreeveeSpan = (card) => {
	if (!card) return
	const spans = card.getElementsByTagName('span') ?? []
	const span = [...spans].find((child) => child.innerText === FREEVEE_INDICATOR)
	span?.remove()
}

const fetchRatings = (card) => {
	const title = getTitle(card)
	if (!title) return

	const apikey = settings.get(Setting.OmdbApiKey)
	if (!apikey) return

	const year = getYear(card)
	const isSeries = isTvSeries(card)
	const type = isSeries ? TYPE_SERIES : TYPE_MOVIE
	const hashKey = videoHashKey(title, year, type)

	// TODO: Update leaving date
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

	const leavingDate = findLeavingPrimeDate(card)

	fetchOmdbResult(params, json => {
		fetchingHash[hashKey] = false

		// const error = json.Error
		// if (error === NO_MOVIE_ERROR || error === NO_SERIES_ERROR) return

		const ratings = dataToScores(json, year)
		if (leavingDate) ratings.leavingPrimeDate = leavingDate
		log("Request:", params, "\nResponse:", json, "\nSaved as:", ratings)
		storeRatings(ratings, hashKey)
		renderRating(card, ratings, hashKey)
	})
}

const findLeavingPrimeDate = (card) => {
	const element = findChildContainingText(card, 'Leaving Prime on')
	if (!element) return undefined

	// Example: 'Jan 1' -> Jan 1 next year in ms
	const dateText = element.innerText.replace(LEAVING_PRIME_TEXT, '').trim()
	const now = new Date()
	const date = new Date(dateText)
	date.setFullYear(now.getFullYear())
	if (date.getTime() < Date.now()) date.setFullYear(now.getFullYear() + 1)
	return date.getTime()
}

const getRottenTomatoesRating = (json) =>
	json?.Ratings?.find(score => score.Source === ROTTEN_TOMATO_API_SOURCE)?.Value || null

const urlWithParams = (uri, params = {}) => {
	const url = new URL(uri)
	url.search = new URLSearchParams(params).toString()
	return {
		fetch: () => fetch(url)
	}
}

function fetchOmdbResult(params, callback) {
	urlWithParams(MOVIE_API_DOMAIN, params)
		.fetch()
		.then(data => data.json())
		.then(callback)
		.catch(error => log("Request failed", error))
}

// Leaving date may be added later
function dataToScores(data = {}, year) {
	const {Title, Year, Type, Country, Genre, Released, Awards, Metascore, imdbRating, tomatoURL, imdbID, imdbVotes, Runtime} = data
	return {
		title: Title,
		year: Year ?? year,
		type: Type,
		...(Runtime   && {runtime: Runtime}),
		...(Country   && {country: Country}),
		...(Genre     && {genre: Genre}),
		...(Released  && {released: Released}),
		...(Awards && Awards !== NA && {awards: Awards}),

		metacritic : cleanScore(Metascore),
		imdb : cleanScore(imdbRating),
		rottenTomatoes : cleanScore(getRottenTomatoesRating(data)),
		...(tomatoURL && tomatoURL !== NA && {tomatoURL}),
		...(imdbID    && {imdbID}),
		...(imdbVotes && {imdbVotes}),
		fetchTime : Date.now()
	}
}

function renderRating(card, ratings, hashKey) {
	if (!card || !ratings) return

	const innerDetailDiv = getInnerVideoDetailDiv(card)
	const outerDetailDiv = getOuterVideoDetailDiv(card)
	const topImageWrapperDiv = getTopImageWrapperDiv(card)

	maybeRemoveFreeveeSpan(card)
	addScoreSpan(innerDetailDiv, ratings, hashKey)
	addScoreSpan(outerDetailDiv, ratings, hashKey)
	if (!outerDetailDiv) addScoreSpan(topImageWrapperDiv, ratings, hashKey, true)
}

const createScoreSpan = ({metacritic, imdb, rottenTomatoes, leavingPrimeDate, awards} = {}, hashKey) => {
	const ratingsContainer = html.toElement(RATINGS_HTML)
	ratingsContainer.querySelector(`.${ROTTEN_TOMATOES_CLASS}`).innerText = rottenTomatoes
	ratingsContainer.querySelector(`.${METACRITIC_CLASS}`).innerText = metacritic
	ratingsContainer.querySelector(`.${IMDB_CLASS}`).innerText = imdb
	const ratingsSpan = ratingsContainer?.querySelector(`.${RATINGS_CLASS}`)
	ratingsSpan?.classList?.add(getRatingSpanClass(hashKey))
	ratingsSpan.addEventListener('click', () => {
		clearRatings(hashKey)
		document.querySelectorAll(`.${getRatingSpanClass(hashKey)}`).forEach(span => span?.remove())
	})
	if (leavingPrimeDate && leavingPrimeDate > Date.now()) {
		const warningText = ratingsContainer.querySelector(`.${DATE_WARNING_CLASS}`)
		const warningIcon = ratingsContainer.querySelector(`.${DATE_WARNING_ICON_CLASS}`)
		const date = new Date(leavingPrimeDate)
		warningText.innerText = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`
		warningText.style.display = 'initial'
		warningIcon.style.display = 'initial'
	}
	const awardsCount = parseAwardsCount(awards)
	if (awardsCount) {
		const trophyText = ratingsContainer.querySelector(`.${TROPHY_CLASS}`)
		const trophyIcon = ratingsContainer.querySelector(`.${TROPHY_ICON_CLASS}`)
		trophyText.innerText = awardsCount
		trophyText.style.display = 'initial'
		trophyIcon.style.display = 'initial'
		trophyText.title = awards
	}
	return ratingsContainer
}

// Example: "Won 1 Oscar. 8 wins & 10 nominations total"
const parseAwardsCount = (awards) => {
	if (!awards) return undefined
	const wins = awards.match(/(\d+) wins?/)?.[1] ?? 0
	const noms = awards.match(/(\d+) nominations?/)?.[1] ?? 0
	return (!wins && !noms) ? undefined : `${wins}/${noms}`
}

const addScoreSpan = (parent, ratings, hashKey, isOverlay = false) => {
	if (parent?.querySelector(`.${RATINGS_CLASS}`) !== null) return

	maybeRemoveImdbSpan(parent)
	const scoreSpan = createScoreSpan(ratings, hashKey)
	if (!isOverlay) parent?.prepend(scoreSpan)
	else {
		alterScoreSpanForOverlay(scoreSpan)
		parent?.append(scoreSpan)
	}
}

const alterScoreSpanForOverlay = (span) => {
	const ratings = span?.querySelector(`.${RATINGS_CLASS}`)
	ratings?.classList?.add(SCORE_SPAN_OVERLAY_CLASS)
	return span
}

const maybeFetchActiveCardRating = () => {
	const card = getActiveCard()
	if (card === activeCard) return

	activeCard = card
	if (!card) return
	log(`New active card: `, card, ` -> ${getTitle(card)}`)

	storage.load(() => fetchRatings(card))
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
	delete hash[hashKey]
	settings.set(Setting.OmdbResultsHash, hash)
}

const getRatings = hashKey => settings.get(Setting.OmdbResultsHash)?.[hashKey]

const videoHashKey = (title = "", year = "", type) => {
	log("hashKey: ", `${title}|${year}|${type}`)
	if (!title || !type) return null
	return `${title}|${year}|${type}`
}

const renderAllRatings = () => {
	renderInitialRatingsLandingPage()
	renderInitialRatingsSecondaryPage()
}

const renderInitialRatingsLandingPage = () => {
	const innerCards = document.getElementsByClassName(TOP_IMAGE_WRAPPER_CLASS)
	const hashKeys = Object.keys(settings.get(Setting.OmdbResultsHash))
	for (const card of innerCards) {
		if (processedCards.has(card)) continue
		processedCards.add(card)

		const ariaTitle = card?.firstElementChild?.ariaLabel
		if (!ariaTitle) continue

		const title = cleanTitle(ariaTitle)
		if (!title) continue

		// TODO: Optimize to have a one-time Set of hash names
		const matchingKey = hashKeys.find(key => key.startsWith(`${title}|`))
		if (!matchingKey) continue
		// log("Adding scores for: ", title, "->", ariaTitle)

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
		if (processedCards.has(card)) continue
		processedCards.add(card)

		const dirtyTitle = card?.querySelector(`.${GRID_ITEM_TITLE_CLASS}`)?.innerText
		if (!dirtyTitle) continue

		const title = cleanTitle(dirtyTitle)
		if (!title) continue

		const matchingKey = hashKeys.find(key => key.startsWith(`${title}|`))
		if (!matchingKey) continue
		// log("Adding scores for: ", title, "->", dirtyTitle)

		const ratings = getRatings(matchingKey)
		renderRating(card, ratings)
	}
}

setInterval(maybeFetchActiveCardRating, 1000)
storage.load(() => {
	setTimeout(renderAllRatings, 2000)
	setInterval(renderAllRatings, 7500)
	setTimeout(maybeAddFiltersToHomepage, 1000)
})

const IMAGE_STYLE = `"vertical-align: middle; width:${IMAGE_SIZE}${IMPORTANT}; height:${IMAGE_SIZE}${IMPORTANT}"`
const HIDDEN_IMAGE_STYLE = `"vertical-align: middle; width:${IMAGE_SIZE}${IMPORTANT}; height:${IMAGE_SIZE}${IMPORTANT}; display: none"`
const RATINGS_HTML = `
	<span class="${RATINGS_CLASS}" style="font-size: ${IMAGE_SIZE}${IMPORTANT}">
		<img src="${RT_IMAGE}" style=${IMAGE_STYLE} />
		<span class="${ROTTEN_TOMATOES_CLASS}" title="Rotten Tomatoes"></span>
		<img src="${MC_IMAGE}" style=${IMAGE_STYLE} />
		<span class="${METACRITIC_CLASS}" title="Metacritic"></span>
		<img src="${IMDB_IMAGE}" style=${IMAGE_STYLE} />
		<span class="${IMDB_CLASS}" title="IMDb"></span>
		<img class="${TROPHY_ICON_CLASS}" src="${C.Icon.TROPHY}" style=${HIDDEN_IMAGE_STYLE}/>
		<span class="${TROPHY_CLASS}" style="display:none"></span>
		<img class="${DATE_WARNING_ICON_CLASS}" src="${C.Icon.WARNING}" style=${HIDDEN_IMAGE_STYLE}/>
		<span class="${DATE_WARNING_CLASS}" style="display:none" title="Leaving Soon"></>
	</span>`