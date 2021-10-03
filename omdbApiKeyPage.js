
const getRegisterBox = () => {
	const input = html.textbox('Api Key')
	const saveButton = html.button('Save Key')
	saveButton.addEventListener(C.Action.Click, () => {
		const key = input.value.trim()
		if (!key) return
		settings.set(Setting.OmdbApiKey, key)
		container.innerHTML = ''
		container.append('Success!')
	})
	const container = html.span()
	container.append(input, ' ', saveButton)
	return container
}

const initializePage = () => {
	const freeRadio = document.getElementById('freeAcct')
	const apiKeyUseInput = document.getElementById('TextArea1')

	if (!freeRadio?.checked) {
		freeRadio?.click()
	} else {
		apiKeyUseInput.value = 'Prime Video Ratings Chrome Extension'

		const group = findParentByClass(apiKeyUseInput, 'form-group')
		if (group) group.style.display = 'none'

		const successLabel = document.getElementById('Label')
		if (successLabel?.innerText?.includes('verification')) {
			successLabel.innerHTML += "<br><br>Open the email, click the verification link, and paste your key here:<br>"
			successLabel.after(getRegisterBox())
		}
	}
}

initializePage()
storage.load()