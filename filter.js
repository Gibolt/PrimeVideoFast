
const INGRESS_HEADER_CLASS = "tst-ingress-container"

const ITEM_PRICE_TIP = "tst-ec"
const PAID_ITEM_TIP = "tst-ec-orange"
const FREE_ITEM_TIP = "tst-ec-blue"
const ADS_ITEM_TIP = "tst-ec-white"

const FILTER_SECTION_CLASS = "custom-filter-section"

const maybeInsertAfterPageHeader = (element) => {
	const header = document.getElementsByClassName(INGRESS_HEADER_CLASS)[0]
	header?.after(element)
}

const filterCheck = (filter) => {
	const value = appliedFilters[filter];
	return html.check(value, (checked) => {
		appliedFilters[filter] = checked;
		adjustCardsBasedOnFilters()
	})
}

const noApiKeyWarning = () => {
	if (settings.get(Setting.OmdbApiKey)) return html.span()

	const apiFlagSection = ApiWarning()
	const warning = apiFlagSection.children[0]

	const omdbApiKeyBox = html.textbox(C.Omdb.KeyHint)
	html.style(omdbApiKeyBox, 'background-color', '#000000')
	omdbApiKeyBox.addEventListener(C.Action.Change, ({ target }) => {
		const newValue = target.value.trim()
		if (!newValue || newValue.length < 8) return

		settings.set(Setting.OmdbApiKey, newValue)
		warning.innerText = 'Api Key set! Reloading page...'
		setTimeout(() => window.location.reload(), 2000)
	})

	warning.prepend(html.img(C.Icon.LOGO, 20))
	warning.append(omdbApiKeyBox)
	return apiFlagSection
}

const createFilters = () => {
	const { minRating } = appliedFilters
	const paidCheck = filterCheck('paid')
	const freeCheck = filterCheck('free')
	const adsCheck = filterCheck('ads')
	const noRatingsCheck = filterCheck('unrated')
	const ratingNumber = html.title(`(${minRating})`)
	const ratingSlider = html.range(minRating, 1, 100, (rating) => {
		appliedFilters.minRating = parseInt(rating)
		adjustCardsBasedOnFilters()
	})
	ratingSlider.addEventListener(C.Action.Input, ({currentTarget}) => {
		ratingNumber.innerText = `(${currentTarget.value})`
	})
	if (!settings.get(Setting.OmdbApiKey)) {
		ratingSlider.disabled = true
		noRatingsCheck.disabled = true
	}
	const filterRow = html.flexRow(
		html.title("Paid: "), paidCheck,
		html.title("Free: "), freeCheck,
		html.title("Ads: "), adsCheck,
		html.title("Min Rating: "), ratingSlider, ratingNumber,
		html.title("No Ratings: "), noRatingsCheck
	);

	const titleRow = html.flexRow(html.h2('Filters'), html.img(C.Icon.LOGO, 20))
	const container = html.flexColumn(noApiKeyWarning(), titleRow, filterRow)
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

const ratingsMeetBar = (minRating, noRatings, ratings) => {
	if (!ratings) return
	const { metacritic, imdb, rottenTomatoes } = ratings
	if (metacritic === '-' && imdb === '-' && rottenTomatoes === '-') {
		return noRatings
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
const adjustCardsBasedOnFilters = () => {
	const innerCards = document.getElementsByClassName(TOP_IMAGE_WRAPPER_CLASS)
	const hashKeys = Object.keys(settings.get(Setting.OmdbResultsHash))
	const { paid, free, ads, unrated, minRating } = appliedFilters
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

		if (minRating > 1 || !unrated) {
			const ariaTitle = card?.firstElementChild?.ariaLabel
			if (ariaTitle) {
				const title = cleanTitle(ariaTitle)
				if (title) {
					const matchingKey = hashKeys.find(key => key.startsWith(`${title}|`))
					if (matchingKey) {
						const ratings = getRatings(matchingKey)
						if (ratings) {
							const meets = ratingsMeetBar(minRating, unrated, ratings)
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