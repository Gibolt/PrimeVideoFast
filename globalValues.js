let activeCard = null
const fetchingHash = {}

const appliedFilters = {
	paid: true,
	free: true,
	ads: true,
	unrated: true,
	minRating: 1,
}

const warningBackground = '#000000'
const textOrange = '#d48800'
// TODO: Move pre-made 'components' to own file
const ApiWarning = () => html.toElement(`
	<span style="border: solid 1px ${textOrange}; border-radius: 8px; background-color: ${warningBackground}; color:${textOrange}; padding: 12px; display: flex; align-items: center; gap: 10px;">
		To enable ratings, sign-up <a href='${C.Omdb.Url}' target='_blank' rel='noreferrer noopener'>for an OMDb API key here (3rd party)</a> and then:
	</span>`)
