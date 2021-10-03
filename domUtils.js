
const findChildContainingText = (element, searchText, exact = false) => {
	let items = [element]
	let item = null
	let lastMatch = null
	do {
		item = items.pop()
		if (!item) continue
		const text = item.innerText
		if (exact && text === searchText) return item
		if (!text.includes(searchText)) continue
		lastMatch = item
		items = [...item.children]
	} while (items.length)
	return lastMatch
}

const findParentByClass = (element, classname) => {
	if (!element) return
	let item = element
	do {
		if (item.classList.contains(classname)) return item
		item = item.parentElement
	} while (element && element !== document.body)
}
