
const createPopupUi = () => {

	const OMDB_REGISTER_TITLE = i18n("omdb_register_cta")
	const OMDB_API_KEY_TITLE = i18n("omdb_api_key_title")
	const OMDB_API_KEY_HINT = i18n("omdb_api_key_hint")
	const myOmdbApiKey = settings.get(Setting.OmdbApiKey)

	const omdbApiKeyBox = html.textbox(OMDB_API_KEY_HINT, myOmdbApiKey)
	omdbApiKeyBox.addEventListener(C.Action.Change, () => {
		const newValue = omdbApiKeyBox.value.trim()
		settings.set(Setting.OmdbApiKey, newValue)
	})

	const omdbRegisterButton = html.button(OMDB_REGISTER_TITLE, () => {
		const omdbRegisterUrl = "https://www.omdbapi.com/apikey.aspx?__EVENTTARGET=freeAcct&__EVENTARGUMENT=&__LASTFOCUS=&__VIEWSTATE=%2FwEPDwUKLTIwNDY4MTIzNQ9kFgYCAQ9kFggCAQ8QDxYCHgdDaGVja2VkZ2RkZGQCAw8QDxYCHwBoZGRkZAIFDxYCHgdWaXNpYmxlZ2QCBw8WAh8BaBYCAgcPDxYCHgRUZXh0BRVQcmltZSBWaWRlbyBFeHRlbnNpb25kZAICDxYCHwFoZAIDDxYCHwFoZBgBBR5fX0NvbnRyb2xzUmVxdWlyZVBvc3RCYWNrS2V5X18WAwULcGF0cmVvbkFjY3QFCGZyZWVBY2N0BQhmcmVlQWNjdBUPf6lb5xGuQIQWf4IvV6VwhQz8cM8D8RzetRMZmLAb&__VIEWSTATEGENERATOR=5E550F58&__EVENTVALIDATION=%2FwEdAAWLZ%2Bs%2Bw64rVSWPX8zkTz1smSzhXfnlWWVdWIamVouVTzfZJuQDpLVS6HZFWq5fYpioiDjxFjSdCQfbG0SWduXFd8BcWGH1ot0k0SO7CfuulJAMOg9Gvvm08DEbSpkdUHPtRbHlB1C2aRGfjCKvvlHW&at=freeAcct&Email="
		window.open(omdbRegisterUrl, "_blank")
		win.focus()
	})

	html.style(omdbRegisterButton, "margin-top", "10px")

	document.body.append(OMDB_API_KEY_TITLE)
	document.body.append(omdbApiKeyBox)
	document.body.append(omdbRegisterButton)
}


storage.load(() => createPopupUi())