
const createPopupUi = () => {

	const myOmdbApiKey = settings.get(Setting.OmdbApiKey)

	const PLAYBACK_SPEED_TITLE = i18n("video_playback_speed_title")
	const PLAYBACK_SPEED_CONTROL_TITLE = i18n("video_playback_speed_control_title")
	const playbackSpeed = settings.get(Setting.InitialPlaybackSpeed)

	const omdbSection = createOmdbSection(myOmdbApiKey)

	const playbackSpeedBox = html.numberBox(playbackSpeed)
	playbackSpeedBox.step = 0.25
	playbackSpeedBox.min = 0.25
	playbackSpeedBox.max = 10
	playbackSpeedBox.addEventListener(C.Action.Change, () => {
		const newValue = playbackSpeedBox.valueAsNumber
		if (isNaN(newValue)) return
		settings.set(Setting.InitialPlaybackSpeed, newValue)
	})

	document.body.append(...[
		omdbSection,
		html.br(),
		PLAYBACK_SPEED_TITLE,
		html.br(),
		playbackSpeedBox,
		" x",
		html.br(),
		PLAYBACK_SPEED_CONTROL_TITLE,
		html.br(),
		...getActionInstructions(),
	])
}

const createOmdbSection = (apiKey, forceCreate = false) => {

	const OMDB_REGISTER_TITLE = i18n("omdb_register_cta")
	const OMDB_EDIT_API_KEY_TITLE = i18n("omdb_edit_api_key_title")
	const OMDB_API_KEY_TITLE = i18n("omdb_api_key_title")
	const OMDB_API_KEY_HINT = i18n("omdb_api_key_hint")

	const omdbSection = html.span()

	const omdbApiKeyBox = html.textbox(OMDB_API_KEY_HINT, apiKey)
	omdbApiKeyBox.addEventListener(C.Action.Change, () => {
		const newValue = omdbApiKeyBox.value.trim()
		settings.set(Setting.OmdbApiKey, newValue)
	})

	const omdbRegisterButton = html.button(OMDB_REGISTER_TITLE, () => {
		// const omdbRegisterUrl = "https://www.omdbapi.com/apikey.aspx?__EVENTTARGET=freeAcct&__EVENTARGUMENT=&__LASTFOCUS=&__VIEWSTATE=%2FwEPDwUKLTIwNDY4MTIzNQ9kFgYCAQ9kFggCAQ8QDxYCHgdDaGVja2VkZ2RkZGQCAw8QDxYCHwBoZGRkZAIFDxYCHgdWaXNpYmxlZ2QCBw8WAh8BaBYCAgcPDxYCHgRUZXh0BRVQcmltZSBWaWRlbyBFeHRlbnNpb25kZAICDxYCHwFoZAIDDxYCHwFoZBgBBR5fX0NvbnRyb2xzUmVxdWlyZVBvc3RCYWNrS2V5X18WAwULcGF0cmVvbkFjY3QFCGZyZWVBY2N0BQhmcmVlQWNjdBUPf6lb5xGuQIQWf4IvV6VwhQz8cM8D8RzetRMZmLAb&__VIEWSTATEGENERATOR=5E550F58&__EVENTVALIDATION=%2FwEdAAWLZ%2Bs%2Bw64rVSWPX8zkTz1smSzhXfnlWWVdWIamVouVTzfZJuQDpLVS6HZFWq5fYpioiDjxFjSdCQfbG0SWduXFd8BcWGH1ot0k0SO7CfuulJAMOg9Gvvm08DEbSpkdUHPtRbHlB1C2aRGfjCKvvlHW&at=freeAcct&Email="
		const omdbRegisterUrl = "https://www.omdbapi.com/apikey.aspx"
		window.open(omdbRegisterUrl, "_blank")
	})
	html.styles(omdbRegisterButton, {"margin-top": "6px", "margin-bottom": "15px"})

	const omdbEditApiKeyButton = html.button(OMDB_EDIT_API_KEY_TITLE, () => {
		const newOmdbSection = createOmdbSection(apiKey, true)
		omdbSection.replaceWith(newOmdbSection)
		newOmdbSection?.firstElementChild?.focus()
	})

	if (forceCreate || apiKey?.length < 6) {
		omdbSection.append(...[
			OMDB_API_KEY_TITLE,
			omdbApiKeyBox,
			omdbRegisterButton,
		])
	} else {
		omdbSection.append(omdbEditApiKeyButton)
	}

	return omdbSection
}

const getActionInstructions = () => {
	const INCREASE = i18n('video_playback_speed_increase')
	const DECREASE = i18n('video_playback_speed_decrease')
	return [html.kbd('+'), ' ', INCREASE, ' / ', html.kbd('-'), ' ', DECREASE]
}

storage.load(createPopupUi)