"use strict"

let playbackSpeed = 1
let lastChange = 0
const rateChange = 0.25
const GAP_BETWEEN_CHANGE_MS = 150
let playbackButtonPlus = null
let playbackButtonMinus = null
let playbackSpeedIndicator = null
let videoPlayer = null
let adCheckerInterval = null
let adCheckerSkippableInterval = null
let preAdRate = null
let skipIntroInterval = null

const videoPlayerClass = "tst-video-overlay-player-html5"
const adIndicatorClass = "atvwebplayersdk-adtimeindicator-text"
const skipIntroClass = "atvwebplayersdk-skipelement-button"
const infoBarClass = "atvwebplayersdk-infobar-container"
const titleClass = "atvwebplayersdk-title-text"
const topButtonsContainerClass = "atvwebplayersdk-hideabletopbuttons-container"
const SKIP_TEXT = "Skip"

const VIDEO_ACTION_BUTTON_IMDB_CLASS = "custom-imdb-link-button"
const VIDEO_ACTION_BUTTON_RT_CLASS = "custom-rt-link-button"

const getImdbSearchUrl = (title) => `https://www.imdb.com/find?q=${title}`
const getImdbTitleUrl = (title) => {
	const id = getHashObjectFromTitle(title)?.imdbID
	return id ? `https://www.imdb.com/title/${id}` : undefined
}
const getImdbUrl = (title) => getImdbTitleUrl(title) ?? getImdbSearchUrl(title)
const getRtUrl = (title) => getHashObjectFromTitle(title)?.tomatoURL

const getHashIdFromTitle = (rawTitle) => {
	const title = cleanTitle(rawTitle)
	const hash = settings.get(Setting.OmdbResultsHash)
	if (!hash) return
	const hashId = Object.keys(hash).find(hashId => hashId.startsWith(title))
	return hashId
}

const getHashObjectFromTitle = (title) => {
	const hashId = getHashIdFromTitle(title)
	return settings.get(Setting.OmdbResultsHash)?.[hashId]
}

const buttons = `
	<div id="PlayBackRatePanel" class="PlayBackRatePanelFullScreen" style="display: inline; top: 2px; right: -44px; bottom: initial; left: initial;">
		<button id="SpeedUp" class="btn btn-right" style="float: right; border-top-right-radius: 5px; border-bottom-right-radius: 5px;">&gt;&gt;</button>
		<button id="PlayBackRate" class="btn" style="float: right">1.00</button>
		<button id="SpeedDown" class="btn btn-left" style="float: right; border-top-left-radius: 5px; border-bottom-left-radius: 5px;">&lt;&lt;</button>
	</div>`

const resetVideoPlayer = () => {
	clearInterval(adCheckerInterval)
	clearInterval(adCheckerSkippableInterval)
	clearInterval(skipIntroInterval)
	adCheckerInterval = null
	adCheckerSkippableInterval = null
	skipIntroInterval = null
	const buttonContainer = document.getElementsByClassName(topButtonsContainerClass)[0]?.children[0]
	buttonContainer?.querySelector(`.${VIDEO_ACTION_BUTTON_IMDB_CLASS}`)?.remove()
	buttonContainer?.querySelector(`.${VIDEO_ACTION_BUTTON_RT_CLASS}`)?.remove()
}

const setupVideoPlaybackControl = () => {
	const click = C.Action.Click
	const video = getMainVideoPlayer()
	if (video === videoPlayer) return
	if (video === null) {
		resetVideoPlayer()
    	videoPlayer = video
		return
	}
	if (video !== videoPlayer) {
		resetVideoPlayer()
	}
	console.log("Video change:", video, videoPlayer)

    videoPlayer = video

	// Click + or - to change video playback speed
	document.addEventListener(C.Action.KeyDown, (event) => {
		const key = event.key

		if (key == "+" || key == "=") increaseRate()
		else if (key == "-") decreaseRate()
	})
	const buttonContainer = document.createElement('div')
	video.parentElement.prepend(buttonContainer)
	buttonContainer.outerHTML = buttons

	playbackButtonPlus = document.getElementById("SpeedUp")
	playbackSpeedIndicator = document.getElementById("PlayBackRate")
	playbackButtonMinus = document.getElementById("SpeedDown")

	playbackButtonPlus.addEventListener(click, increaseRate)
	playbackButtonMinus.addEventListener(click, decreaseRate)
	video.addEventListener(C.Event.Media.Play, () => {
		console.log("Video playback started")
		updateRate()
	})
	video.addEventListener(C.Event.Media.Playing, () => {
		console.log("Video now playing")
		updateRate()
	})
	video.addEventListener(C.Event.Media.DurationChange, () => {
		console.log("Video duration change")
		updateRate()
	})
	video.addEventListener(C.Event.Media.LoadStart, () => {
		console.log("Video load start")
		updateRate()
	})

	const titleElement = document.getElementsByClassName(titleClass)[0]
	console.log('title:', titleElement, `"${titleElement?.innerText}"`)
	if (titleElement) setTimeout(() => {
		console.log('title2:', titleElement, `"${titleElement?.innerText}"`)
		if (!titleElement?.innerText) return
		const title = titleElement.innerText
		const imdbUrl = getImdbUrl(title)
		const rtUrl = getRtUrl(title)
		titleElement?.addEventListener('click', () => window.open(imdbUrl,"_blank"))
		const imdbLogo = html.imgButton(C.Icon.IMDB, () => window.open(imdbUrl,"_blank"), 28)
		const rtLogo = html.imgButton(RT_IMAGE, () => window.open(rtUrl,"_blank"), 28)
		imdbLogo.classList.add(VIDEO_ACTION_BUTTON_IMDB_CLASS)
		rtLogo.classList.add(VIDEO_ACTION_BUTTON_RT_CLASS)
		imdbLogo.style.marginRight = '26px'
		rtLogo.style.marginRight = '26px'
		const buttonContainer = document.getElementsByClassName(topButtonsContainerClass)[0]?.children[0]
		console.log('buttonContainer:', buttonContainer, imdbUrl, rtUrl)
		if (rtUrl) buttonContainer?.prepend(rtLogo)
		buttonContainer?.prepend(imdbLogo)
	}, 5000)

	console.log('Adding Ad checkers')
	adCheckerInterval ??= setInterval(detectAndSkipAds, 2000)
	adCheckerSkippableInterval ??= setInterval(detectAndSkipPreroll, 2000)
	skipIntroInterval ??= setInterval(detectAndSkipIntro, 2000)

	updateRate()
}

const increaseRate = function() {
	if (!canUpdate()) return

	playbackSpeed += rateChange
	updateRate()
}

const decreaseRate = function() {
	if (!canUpdate()) return

	playbackSpeed -= rateChange
	if (playbackSpeed < 0) playbackSpeed = 0
	updateRate()
}

const updateRate = function() {
	console.log(videoPlayer)
	console.log("playbackSpeed: " + playbackSpeed)
	if (videoPlayer !== null) videoPlayer.playbackRate = playbackSpeed
	if (playbackSpeedIndicator !== null) playbackSpeedIndicator.innerText = playbackSpeed
}

// Only allow changes outside delay
const canUpdate = function() {
	const now = Date.now()
	const canChange = (now > lastChange + GAP_BETWEEN_CHANGE_MS)
	if (canChange) lastChange = now
	return canChange
}

const detectAndSkipAds = () => {
	if (preAdRate !== null) return
	const indicator = document.getElementsByClassName(adIndicatorClass)[0]?.textContent ?? ""
	if (!indicator) return
	const adLengthSec = indicator.match(/\d+/)?.[0] ?? 0
	if (adLengthSec <= 2) return

	const timeDelayMs = (adLengthSec - 2) * 100
	preAdRate = playbackSpeed
	playbackSpeed = 10
	updateRate()
	setTimeout(() => {
		playbackSpeed = preAdRate
		preAdRate = null
		updateRate()
	}, timeDelayMs)
}

const detectAndSkipPreroll = () => {
	const infoBar = document.getElementsByClassName(infoBarClass)[0]
	if (!infoBar) return

	let item = findChildContainingText(infoBar, SKIP_TEXT, true)
	if (!item) return
	console.log('Found skip preroll: ', item)
	setTimeout(() => item?.click(), 2000)
}

const detectAndSkipIntro = () => {
	const skipIntroButton = document.getElementsByClassName(skipIntroClass)[0]
	if (!skipIntroButton) return

	console.log('Found skip intro: ', skipIntroButton)
	setTimeout(() => skipIntroButton?.click(), 100)
}

//.btn {
//    font-size: 12px;
//    background: rgba(255, 255, 255, 0.5);
//    padding: 5px;
//    text-decoration: none;
//    border-width: 0px;
//    border-style: initial;
//    border-color: initial;
//    border-image: initial;
//}

const getMainVideoPlayer = () => {
	const videos = document.getElementsByTagName('video')
	if (videos.length === 0) return null

	for (const video of videos) {
		if (video.className.includes(videoPlayerClass)) continue
		return video
	}
	return null
}

const runMainFunctionRepeatedly = function() {
	setInterval(() => {
        setupVideoPlaybackControl()
    }, 5000)
	storage.load(() => playbackSpeed = settings.get(Setting.InitialPlaybackSpeed))
}

runMainFunctionRepeatedly()
