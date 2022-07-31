
const INGRESS_HEADER_CLASS = "tst-ingress-container"

const ITEM_PRICE_TIP = "tst-ec"
const PAID_ITEM_TIP = "tst-ec-orange"
const FREE_ITEM_TIP = "tst-ec-blue"
const ADS_ITEM_TIP = "tst-ec-white"

const FILTER_SECTION_CLASS = "custom-filter-section"

const maybeInsertAfterPageHeader = (element) => {
	const header = document.getElementsByClassName(INGRESS_HEADER_CLASS)[0]
	console.log('header', header)
	header?.after(element)
}

const createFilters = () => {
	const onChangeFilters = () => {
		adjustCardsBasedOnFilters(paidCheck.checked, freeCheck.checked, adsCheck.checked)
	}
	const container = html.div(FILTER_SECTION_CLASS)
	const paidCheck = html.check(true, onChangeFilters)
	const freeCheck = html.check(true, onChangeFilters)
	const adsCheck = html.check(true, onChangeFilters)
	container.append(
		html.title("Paid: "), paidCheck,
		html.title("Free: "), freeCheck,
		html.title("Ads: "), adsCheck
	);
	html.styles(container, {
		"display": "flex",
		"gap": "20px",
		"align-items": "baseline",
		"margin-left": "50px",
		"padding-top": "24px",
	})
	return container
}

const maybeAddFiltersToHomepage = () => {
	if (document.getElementsByClassName(FILTER_SECTION_CLASS).length) return

	maybeInsertAfterPageHeader(createFilters())
}

const setVisibility = (item, visible) => {
	html.style(item, 'visibility', visible ? 'visible' : 'hidden')
}

const setDisplayedIB = (item, visible) => {
	if (visible && item.style.display !== 'none') {
		return
	}
	html.style(item, 'display', visible ? 'inline-block' : 'none')
}

// TODO: Run this on any newly added cards
// TODO: Make these properties global
// TODO: Add these to settings
const adjustCardsBasedOnFilters = (paid, free, ads) => {
	const innerCards = document.getElementsByClassName(TOP_IMAGE_WRAPPER_CLASS)
	console.log(innerCards)
	for (const card of innerCards) {
		const priceTip = card.getElementsByClassName(ITEM_PRICE_TIP)[0]
		const list = priceTip?.classList
		if (!list) continue
		const wrapper = findParentByTagName(card, 'li')
		if (list.contains(PAID_ITEM_TIP)) {
			setDisplayedIB(wrapper, paid)
			continue
		}
		else if (list.contains(FREE_ITEM_TIP)) {
			setDisplayedIB(wrapper, free)
			continue
		}
		else if (list.contains(ADS_ITEM_TIP)) {
			setDisplayedIB(wrapper, ads)
			continue
		}
	}
}