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

	const range = (initialValue, min, max, fn = C.Noop) => {
		const range = document.createElement("input")
		range.type = "range"
		range.min = min
		range.max = max
		range.value = initialValue
		// html.styles(range, { height: "20px", width: "20px", outline: "3px solid var(--nc-lk-1)", "border-radius": "5px", "outline-style": "auto" })
		if (typeof fn === "function") range.addEventListener(C.Action.Change, ({currentTarget}) => fn(currentTarget.value), false)
		return range
	}

	const img = (src = "", size) => {
		const img = document.createElement("img")
		img.src = src
		if (size) {
			img.height = size
			img.width = size
		}
		return img
	}

	const imgButton = (src = "", fn = C.Noop, size) => {
		const img = html.img(src, size)
		if (typeof fn === "function") img.addEventListener(C.Action.Click, fn, false)
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

	const flexDiv = (...children) => {
		const flex = html.div()
		html.styles(flex, {
			"display": "flex",
			"gap": "10px",
		})
		flex.append(...children)
		return flex
	}
	const flexRow = (...children) => {
		const flex = flexDiv(...children)
		html.styles(flex, { "flex-direction": "row" })
		return flex
	}
	const flexColumn = (...children) => {
		const flex = flexDiv(...children)
		html.styles(flex, { "flex-direction": "column" })
		return flex
	}

	const kbd = (text) => {
		const kbd = document.createElement("kbd")
		kbd.innerText = text
		return kbd
	}
	const h2 = (text) => {
		const h2 = document.createElement("h2")
		h2.innerText = text
		html.styles(h2, {"font-size": "19px", "font-weight": "700", "line-height": "24px"})
		return h2
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
		flexRow,
		flexColumn,
		check,
		range,
		img,
		imgButton,

		kbd,
		h2,
		title,
	}
	return publicApi
})()
