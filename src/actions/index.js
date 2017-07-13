import axios from 'axios'
import store from '../store'
import { push } from 'react-router-redux'

//const FETCH_WIKIPAGE = 'FETCH_WIKIPAGE'

export function fetchTsneData(pageName) {
	console.log('fetchTsneData', pageName)
	return {
  		type: 'FETCH_TSNE',
  		//payload: axios.get(`data/withids.json`)
  		payload: axios.get(`data/rasteredxx.json`) //TODO load from server to make json files consistent
	}
}

export function fetchPageLocation(pageName) {
	console.log('fetchPageLocation', pageName)
	return {
  		type: 'FETCH_LOCATION',
  		payload: axios.get(`http://elephant.local:8888/similars?title=${pageName}`)
	}
}

export function hoveredOnMap(item) {
	return {
		type: 'HOVERED_ON_MAP',
		payload: item
	}
}

export function navigateToPage(pageName) {
	console.log('navigateToPage', pageName)
	return {
  		type: 'NAVIGATE_TO_PAGE',
  		payload: pageName
	}
}

export function fetchWikiPage() {
	const pageName = store.getState().wikipage.pageTitle
	console.log('fetchWikiPage', pageName)
	return {
  		type: 'FETCH_WIKIPAGE',
  		//payload: axios.get(`https://en.wikipedia.org/w/api.php?action=query&origin=*&prop=revisions&rvlimit=1&rvprop=content&format=json&&explaintext&pageids=303`)
  		//payload: axios.get(`http://toymaker.local:8000/en.wikipedia.org/v3/page/html/${pageName}`)
  		payload: axios.get(`https://en.wikipedia.org/w/api.php?action=parse&origin=*&format=json&page=${pageName}&contentmodel=wikitext&prop=text`)
	}
}

export function zoomIn() {
	return {
		type: 'MAP_ZOOM_IN',
	}
}

export function zoomOut() {
	return {
		type: 'MAP_ZOOM_OUT',
	}
}


export function checkRedirectAndFetch(pageName) {
	return (dispatch) => {
		axios.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${pageName}&redirects&origin=*`)
		.then((response) => {
			const json = response.data
			console.log(json)
			if(json.query.redirects && json.query.redirects.length) {
				const newPage = json.query.redirects[0].to
				console.log(newPage)
				//TODO: these should not be here. here url needs to be updated and navigateToPage etc. sould 
				// be called from Root.js when url changes. (same as block below)
				dispatch(navigateToPage(newPage))
				dispatch(fetchPageLocation(newPage))
				dispatch(fetchWikiPage(newPage))
				dispatch(push(newPage))
			}
			else {
				dispatch(navigateToPage(pageName))
				dispatch(fetchPageLocation(pageName))
				dispatch(fetchWikiPage(pageName))
				dispatch(push(pageName))
			}
		}) 
	}
}