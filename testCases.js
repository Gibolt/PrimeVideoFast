

const TEST_TITLE = "Gone with the Wind"
const TEST_DATA = {"Title":"Gone with the Wind","Year":"1939","Rated":"Passed","Released":"17 Jan 1940","Runtime":"238 min","Genre":"Drama, History, Romance, War","Director":"Victor Fleming, George Cukor, Sam Wood","Writer":"Margaret Mitchell (story of the old south \"Gone with the Wind\"), Sidney Howard (screenplay)","Actors":"Thomas Mitchell, Barbara O'Neil, Vivien Leigh, Evelyn Keyes","Plot":"A manipulative woman and a roguish man conduct a turbulent romance during the American Civil War and Reconstruction periods.","Language":"English","Country":"USA","Awards":"Won 8 Oscars. Another 12 wins & 12 nominations.","Poster":"https://m.media-amazon.com/images/M/MV5BYjUyZWZkM2UtMzYxYy00ZmQ3LWFmZTQtOGE2YjBkNjA3YWZlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg","Ratings":[{"Source":"Internet Movie Database","Value":"8.1/10"},{"Source":"Rotten Tomatoes","Value":"91%"},{"Source":"Metacritic","Value":"97/100"}],"Metascore":"97","imdbRating":"8.1","imdbVotes":"280,849","imdbID":"tt0031381","Type":"movie","tomatoMeter":"N/A","tomatoImage":"N/A","tomatoRating":"N/A","tomatoReviews":"N/A","tomatoFresh":"N/A","tomatoRotten":"N/A","tomatoConsensus":"N/A","tomatoUserMeter":"N/A","tomatoUserRating":"N/A","tomatoUserReviews":"N/A","tomatoURL":"http://www.rottentomatoes.com/m/gone_with_the_wind/","DVD":"07 Mar 2000","BoxOffice":"N/A","Production":"Loew&#39;s Inc.","Website":"N/A","Response":"True"}

// Currently must be run from the console
// TODO: Find a better home for unit tests
const runAllTests = () => {
	testTitleCleanup()
	testSeriesTypeCheck()
}

const testTitleCleanup = () => {
	for (const [originalTitle, expectedTitle] of Object.entries(TEST_TITLE_CASES)) {
		const cleanedTitle = cleanTitle(originalTitle)
		if (cleanedTitle !== expectedTitle)
			console.error(`Expected clean title\n  "${expectedTitle}" but was \n  "${cleanedTitle}" for\n  "${originalTitle}"`)
	}
}

const testSeriesTypeCheck = () => {
	for (const [cta, isSeriesExpected] of Object.entries(TEST_SERIES_CHECK_CASES)) {
		const isSeries = isCtaForSeries(cta)
		if (isSeries !== isSeriesExpected)
			console.error(`Expected series for "${cta}" to be ${isSeriesExpected}`)
	}
}

// Cases to check that title cleanup is working reliably
const TEST_TITLE_CASES = {
	"Warehouse 13 Season 1" : "Warehouse 13",
	"Schitt's Creek Season 1 (Uncensored)" : "Schitt's Creek",
	"Nikita: The Complete First Season" : "Nikita",
	"The Rockford Files, Season 1" : "The Rockford Files",
	"Desperate Housewives Season 8" : "Desperate Housewives",
	"Heroes Volume 1" : "Heroes",
	"Sherlock Holmes (2009)" : "Sherlock Holmes",
	"Murder, She Wrote - Season 1" : "Murder, She Wrote",
	"Sneaky Pete - Season 2 (4K UHD)" : "Sneaky Pete",
	"Uncut Gems (4k UHD)" : "Uncut Gems",
	"Dennis The Menace, Season One" : "Dennis The Menace",
	"Marvel's Avengers [Ultra HD]" : "Avengers",
	"Anthony Bourdain A Cook's Tour" : "A Cook's Tour",
	"Tyler Perry's Acrimony" : "Acrimony",
	"Top Gear Season 14 (UK)" : "Top Gear",
	"Rambo: Last Blood (Extended Cut)" : "Rambo: Last Blood",
	"Twilight - Extended Edition" : "Twilight",
	"The Tale of The Princess Kaguya (Japanese Language)" : "The Tale of The Princess Kaguya",
	"The Complete Metropolis (Silent)" : "The Complete Metropolis",
	"Downton Abbey The Final Season" : "Downton Abbey",
}

// Cases to handle with title cleanup that don't have an obvious solution
const UNHANDLED_TITLE_CASES = {
	"Pop Team Epic (Original Japanese Version)" : "Pop Team Epic",
}

// Cases to check that CTA regex can reliably determine show type
const TEST_SERIES_CHECK_CASES = {
	"Play" : false,
	"Play S1 E3" : true,
	"Play S10 E15" : true,
	"Play Episode 1" : true,
	"Play Episode 10" : true,
	"Play S101 E1" : true,
}
