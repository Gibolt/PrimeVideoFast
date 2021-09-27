"use strict"

let playbackSpeed = 1
let lastChange = 0
const rateChange = 0.25
const GAP_BETWEEN_CHANGE_MS = 150
let playbackButtonPlus = null
let playbackButtonMinus = null
let playbackSpeedIndicator = null
let videoPlayer = null
let adChecker = null
let preAdRate = null

const adIndicatorClass = "atvwebplayersdk-adtimeindicator-text"

const buttons = `
	<div id="PlayBackRatePanel" class="PlayBackRatePanelFullScreen" style="display: inline; top: 2px; right: -44px; bottom: initial; left: initial;">
		<button id="SpeedUp" class="btn btn-right" style="float: right; border-top-right-radius: 5px; border-bottom-right-radius: 5px;">&gt;&gt;</button>
		<button id="PlayBackRate" class="btn" style="float: right">1.00</button>
		<button id="SpeedDown" class="btn btn-left" style="float: right; border-top-left-radius: 5px; border-bottom-left-radius: 5px;">&lt;&lt;</button>
	</div>`

const setupVideoPlaybackControl = function() {
	const click = C.Action.Click
	const video = getMainVideoPlayer()
	if (video === null || video === videoPlayer) {
		clearInterval(adChecker)
		adChecker = null
		return
	}

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

	adChecker ??= setInterval(detectAndSkipAds, 2000)

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
		if (video.className.includes("tst-video-overlay-player-html5")) continue
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
