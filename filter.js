
const INGRESS_HEADER_CLASS = "tst-ingress-container"

const ITEM_PRICE_TIP = "tst-ec"
const PAID_ITEM_TIP = "tst-ec-orange"
const FREE_ITEM_TIP = "tst-ec-blue"
const ADS_ITEM_TIP = "tst-ec-white"

const FILTER_SECTION_CLASS = "custom-filter-section"

const DEFAULT_MIN_RATING = 1

const maybeInsertAfterPageHeader = (element) => {
	const header = document.getElementsByClassName(INGRESS_HEADER_CLASS)[0]
	header?.after(element)
}

const createFilters = () => {
	const onChangeFilters = () => {
		adjustCardsBasedOnFilters(paidCheck.checked, freeCheck.checked, adsCheck.checked, parseInt(minRating.value))
	}

	const paidCheck = html.check(true, onChangeFilters)
	const freeCheck = html.check(true, onChangeFilters)
	const adsCheck = html.check(true, onChangeFilters)
	const minRatingSet = html.title(`(${DEFAULT_MIN_RATING})`)
	const minRating = html.range(DEFAULT_MIN_RATING, 1, 100, (a) => {
		console.log(minRating, a)
		onChangeFilters()
	})
	minRating.addEventListener(C.Action.Input, ({currentTarget}) => {
		minRatingSet.innerText = `(${currentTarget.value})`
	})
	const filterRow = html.flexRow(
		html.title("Paid: "), paidCheck,
		html.title("Free: "), freeCheck,
		html.title("Ads: "), adsCheck,
		html.title("Min Rating: "), minRating, minRatingSet
	);

	const titleRow = html.flexRow(html.h2('Filters'), html.img(C.Icon.LOGO, 20))
	const container = html.flexColumn(titleRow, filterRow)
	container.className = FILTER_SECTION_CLASS
	html.styles(container, {
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

const ratingsMeetBar = (minRating, ratings) => {
	if (!ratings) return
	const { metacritic, imdb, rottenTomatoes } = ratings
	if (metacritic === '-' && imdb === '-' && rottenTomatoes === '-') {
		return true
	}

	if (metacritic !== '-' && parseFloat(metacritic) >= minRating) {
		return true
	}
	if (imdb !== '-' && parseFloat(imdb) * 10 >= minRating) {
		return true
	}
	if (rottenTomatoes !== '-' && parseFloat(rottenTomatoes) >= minRating) {
		return true
	}

	return false
}

// TODO: Run this on any newly added cards
// TODO: Make these properties global
// TODO: Add these to settings
const adjustCardsBasedOnFilters = (paid, free, ads, minRating) => {
	const innerCards = document.getElementsByClassName(TOP_IMAGE_WRAPPER_CLASS)
	const hashKeys = Object.keys(settings.get(Setting.OmdbResultsHash))
	for (const card of innerCards) {
		const priceTip = card.getElementsByClassName(ITEM_PRICE_TIP)[0]
		const list = priceTip?.classList
		if (!list) continue

		const wrapper = findParentByTagName(card, 'li')
		if (!paid && list.contains(PAID_ITEM_TIP)) {
			setDisplayedIB(wrapper, false)
			continue
		}
		else if (!free && list.contains(FREE_ITEM_TIP)) {
			setDisplayedIB(wrapper, false)
			continue
		}
		else if (!ads && list.contains(ADS_ITEM_TIP)) {
			setDisplayedIB(wrapper, false)
			continue
		}

		if (minRating > 1) {
			const ariaTitle = card?.firstElementChild?.ariaLabel
			if (ariaTitle) {
				const title = cleanTitle(ariaTitle)
				if (title) {
					const matchingKey = hashKeys.find(key => key.startsWith(`${title}|`))
					if (matchingKey) {
						const ratings = getRatings(matchingKey)
						if (ratings) {
							const meets = ratingsMeetBar(minRating, ratings)
							setDisplayedIB(wrapper, meets)
							continue
						}
					}
				}
			}
		}

		setDisplayedIB(wrapper, true)
	}
}