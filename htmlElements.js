const html = (() => {
	const style = (node, style = "", value = null) => {
		if (!node) return
		
		if (!node.style) {
			console.error("Set style failed for node: ", node)
			return
		}
		node.style.setProperty(style, value)
		return node
	}

	const toElement = (html = "") => {
		const template = document.createElement("template")
		template.innerHTML = html.trim()
		return template.content
	}

	const textbox = (placeholder = "", value = "") => {
		const box = document.createElement("input")
		box.type  = "text"
		box.value = value
		if (placeholder) box.placeholder = placeholder
		return box
	}

	const button = (text = "", fn = C.Noop, title = "") => {
		const button = document.createElement("input")
		button.type = "button"
		if (text) button.value = text
		if (typeof fn === "function") button.addEventListener(C.Action.Click, fn, false)
		if (title) button.title = title
		return button
	}

	const publicApi = {
		style,
		toElement,

		textbox,
		button,
	}
	return publicApi
})()