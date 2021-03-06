"use strict"

const log = console.log
const i18n = chrome.i18n.getMessage
const getImage = (filename) => chrome.extension.getURL(`img/${filename}`)

const Constants = {}
const C = Constants

Constants.Noop = () => {}

// All in milliseconds
Constants.Time = Object.freeze({
	MILLISECOND : 1,
	SECOND : 1000,
	MINUTE : 60000,
	HOUR   : 3600000,
	DAY    : 86400000,
	WEEK   : 604800000,
	YEAR   : 31536000000, // Approximate
	MS  : 1,
	S   : 1000,
	SEC : 1000,
	M   : 60000,
	MIN : 60000,
	H   : 3600000,
	D   : 86400000,
	W   : 604800000,
	Y   : 31536000000, // Approximate
})

Constants.Action = Object.freeze({
	Change : "change",
	Click : "click",
	KeyDown : "keydown",
	KeyUp : "keyup",
})

Constants.Event = Object.freeze({
	Media : Object.freeze({
		DurationChange : "durationchange",
		LoadStart : "loadstart",
		Play : "play",
		Playing : "playing",
	}),
})

Object.freeze(Constants)
