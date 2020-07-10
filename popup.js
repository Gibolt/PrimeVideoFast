
const createPopupUi = () => {

	const omdbRegisterTitle = "Go Register"
	const omdbApiKeyTitle = "OMDB Api Key"

	const omdbApiKeyBox = document.createElement("input")
	omdbApiKeyBox.value = settings.get(Setting.OmdbApiKey)
	omdbApiKeyBox.addEventListener(C.Action.Change, () => {
		const newValue = omdbApiKeyBox.value.trim()
		settings.set(Setting.OmdbApiKey, newValue)
	})

	const omdbRegisterButton = document.createElement("button")
	omdbRegisterButton.innerText = omdbRegisterTitle
	omdbRegisterButton.addEventListener(C.Action.Click, () => {
		const omdbRegisterUrl = "https://www.omdbapi.com/apikey.aspx?__EVENTTARGET=freeAcct&__EVENTARGUMENT=&__LASTFOCUS=&__VIEWSTATE=%2FwEPDwUKLTIwNDY4MTIzNQ9kFgYCAQ9kFggCAQ8QDxYCHgdDaGVja2VkZ2RkZGQCAw8QDxYCHwBoZGRkZAIFDxYCHgdWaXNpYmxlZ2QCBw8WAh8BaBYCAgcPDxYCHgRUZXh0BRVQcmltZSBWaWRlbyBFeHRlbnNpb25kZAICDxYCHwFoZAIDDxYCHwFoZBgBBR5fX0NvbnRyb2xzUmVxdWlyZVBvc3RCYWNrS2V5X18WAwULcGF0cmVvbkFjY3QFCGZyZWVBY2N0BQhmcmVlQWNjdBUPf6lb5xGuQIQWf4IvV6VwhQz8cM8D8RzetRMZmLAb&__VIEWSTATEGENERATOR=5E550F58&__EVENTVALIDATION=%2FwEdAAWLZ%2Bs%2Bw64rVSWPX8zkTz1smSzhXfnlWWVdWIamVouVTzfZJuQDpLVS6HZFWq5fYpioiDjxFjSdCQfbG0SWduXFd8BcWGH1ot0k0SO7CfuulJAMOg9Gvvm08DEbSpkdUHPtRbHlB1C2aRGfjCKvvlHW&at=freeAcct&Email="
		window.open(omdbRegisterUrl, "_blank")
		win.focus()
	})

	html.style(omdbRegisterButton, "margin-top", "10px")

	document.body.append(omdbApiKeyTitle)
	document.body.append(omdbApiKeyBox)
	document.body.append(omdbRegisterButton)
}


storage.load(() => createPopupUi())