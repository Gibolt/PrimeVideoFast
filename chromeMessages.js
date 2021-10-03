"use strict"

const message = (() => {

	// Create unique ids for Message intents
	let e = 0
	const TypeEnum = Object.freeze({
	})

	const tabs = (() => {
		const tabApiExists = () => chrome?.tabs

		const baseTabQuery = function(which, settings, callback = C.Noop) {
			if (!tabApiExists()) return
			chrome.tabs.query(which, tabs => {
				for (const tab of tabs) {
					chrome.tabs.sendMessage(tab.id, settings, callback)
				}
			})
		}

		const active = function(settings, callback = C.Noop) {
			const which = {
				active : true,
				currentWindow : true,
			}
			baseTabQuery(which, settings, callback)
		}

		const all = function(settings, callback = C.Noop) {
			const which = {}
			baseTabQuery(which, settings, callback)
		}

		const inactive = function(settings, callback = C.Noop) {
			const which = {active : false}
			baseTabQuery(which, settings, callback)
		}

		const publicApi = {
			active,
			all,
			inactive,
		}
		return publicApi
	})()

	// `callback` should be of form function(req, sender, res)
	const addListener = (callback = C.Noop) =>
		chrome?.runtime?.onMessage?.addListener(callback)

	const publicApi = {
		Type : TypeEnum,
		addListener,
		tabs,
	}
	return publicApi
})()
