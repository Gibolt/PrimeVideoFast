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

	const styles = (node, stylesObj = {}) => {
		if (!node || !stylesObj) return node
		for (const style in stylesObj) {
			html.style(node, style, stylesObj[style])
		}
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

	const numberBox = (value = 0) => {
		const box = document.createElement("input")
		box.type  = "number"
		box.value = value
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

	const check = (initialValue, fn = C.Noop) => {
		const check = document.createElement("input")
		check.type = "checkbox"
		check.checked = initialValue
		html.styles(check, { height: "20px", width: "20px", outline: "3px solid var(--nc-lk-1)", "border-radius": "5px", "outline-style": "auto" })
		if (typeof fn === "function") check.addEventListener(C.Action.Change, ({currentTarget}) => fn(currentTarget.checked), false)
		return check
	}

	const imgButton = (src = "", fn = C.Noop, size) => {
		const img = document.createElement("img")
		img.src = src
		if (typeof fn === "function") img.addEventListener(C.Action.Click, fn, false)
		if (size) {
			img.height = size
			img.width = size
		}
		return img
	}

	const br = () => document.createElement("br")
	const div = (className) => {
		const div = document.createElement("div")
		if (className) div.className = className
		return div
	}
	const span = (className) => {
		const span = document.createElement("span")
		if (className) span.className = className
		return span
	}
	const kbd = (text) => {
		const kbd = document.createElement("kbd")
		kbd.innerText = text
		return kbd
	}

	const title = (text) => {
		const title = document.createElement("p")
		title.innerText = text
		html.styles(title, {"font-size": "16px", "font-weight": 600})
		return title
	}

	const publicApi = {
		style,
		styles,
		toElement,

		textbox,
		numberBox,
		button,
		br,
		div,
		span,
		check,
		imgButton,
		kbd,

		title,
	}
	return publicApi
})()