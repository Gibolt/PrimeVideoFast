"use strict"

// TODO: Make stored settings private
const storage = (() => {

	let loaded = false

	const load = (callback = C.Noop) => {
		if (loaded) {
			callback()
			return
		}

		try {
			chrome.storage.sync.get("settings", (storedObj) => {
				if (!loaded) {
					if (storedObj && storedObj.settings) {
						storage.settings = storedObj.settings
					}
					loaded = true
				}
				callback()
			})
		}
		catch(e){}
	}

	const reload = (callback = C.Noop) => {
		loaded = false
		load(callback)
	}

	const set = (prop, val) => {
		if (!loaded) {
			console.error("Attempted to set setting before settings load finished")
		}
		storage.settings[prop] = val
		chrome.storage.sync.set({"settings" : storage.settings}, () => {
			chrome.runtime.sendMessage({type : message.Type.UpdateSettings})
			message.tabs.all({type : message.Type.UpdateSettings})
		})
	}

	return {
		load,
		reload,
		set,
		settings : {},
	}
})()

const settings = (() => {
	// These indicate expected type for reference, checks are only by Javascript type
	const DATE = 0 // in ms
	const INTEGER = 0
	const FLOAT = 0.0
	const STRING = ""
	const TRUE = true
	const FALSE = false
	// const ARRAY = [] // Define inline
	// const OBJECT = {} // Define inline

	const settingDefaultValues = Object.freeze({
		// Key used to access OMDB Api. Required for ratings to work
		"OmdbApiKey" : STRING,

		// Key used to store OMDB results. Format: {[title + year + type]: {imdb, metacritic, rottenTomatoes, type, time}
		"OmdbResultsHash" : {},
	})

	const KEYS = Object.keys(settingDefaultValues)
		.reduce((keys, key) => {
			keys[key] = key
			return keys
		}, {})

	const settingKeyExists = function(settingName) {
		const defaultValue = settingDefaultValues[settingName]
		return (defaultValue !== undefined && settingDefaultValues.hasOwnProperty(settingName))
	}

	const isDefaultValue = function(settingName) {
		if (!settingKeyExists(settingName)) return false

		const defaultValue = getDefaultValue(settingName)
		const currentValue = getSettingValue(settingName)
		return (defaultValue === currentValue)
	}

	const getDefaultValue = function(settingName) {
		const exists = settingKeyExists(settingName)

		return (exists)
			? settingDefaultValues[settingName]
			: undefined
	}

	const setDefaultValue = function(settingName) {
		const exists = settingKeyExists(settingName)
		const defaultSettingValue = getDefaultValue(settingName)
		if (exists) {
			setSettingValue(settingName, defaultSettingValue)
		}
		return defaultSettingValue
	}

	const canSetValue = function(settingName, newValue) {
		if (!settingKeyExists(settingName)) return false

		const newValueType = typeof newValue
		const expectedObjectType = typeof getDefaultValue(settingName)

		const isSameValue = (newValue === getSettingValue(settingName))
		const isObjectType = (newValueType === "object")
		const isSameType = (newValueType === expectedObjectType)
		if (!isSameType) {
			console.error(`Can't set [${settingName}] to [${newValue}]. Expects [${typeof getDefaultValue(settingName)}], got [${typeof newValue}]`)
		}
		return ((!isSameValue || isObjectType) && isSameType)
	}

	const getSettingValue = function(settingName) {
		const exists = settingKeyExists(settingName)
		const defaultValue = getDefaultValue(settingName)
		if (!exists) return defaultValue

		const settingValue = storage.settings[settingName]
		const actualValue = (settingValue !== undefined) ? settingValue : defaultValue
		return actualValue
	}

	const setSettingValue = function(settingName, newValue) {
		if (!canSetValue(settingName, newValue)) return

		storage.set(settingName, newValue)
	}

	const publicApi = {
		get : getSettingValue,
		set : setSettingValue,
		isDefault : isDefaultValue,
		Setting : Object.freeze(KEYS),
	}
	return publicApi
})()

const {Setting} = settings
