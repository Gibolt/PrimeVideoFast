"use strict"

const log = console.log
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
	Click : "click",
	KeyDown : "keydown",
	KeyUp : "keyup",
	Play : "play",
	Play : "playing",
	Play : "loadstart",
	DurationChange : "durationchange",
})

Constants.Event = Object.freeze({
	Media : Object.freeze({
		DurationChange : "durationchange",
		LoadStart : "loadstart",
		Play : "play",
		Playing : "playing",
	}),
})

Constants.Class = Object.freeze({
	FullOverlay : "fullScreenOverlay",
})

Constants.Timing = Object.freeze({
	BlinkDuration : 100 * C.Time.MILLISECOND,
	BlinkInterval : 15 * C.Time.SECOND,
})

Object.freeze(Constants)
