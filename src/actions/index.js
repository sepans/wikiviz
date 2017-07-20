import axios from 'axios'
import store from '../store'
import { push } from 'react-router-redux'

//const FETCH_WIKIPAGE = 'FETCH_WIKIPAGE'

export function fetchTsneData(pageName) {
	return {
  		type: 'FETCH_TSNE',
  		//payload: axios.get(`data/withids.json`)
  		payload: axios.get(`data/rasteredxx.json`) //TODO load from server to make json files consistent
	}
}

export function fetchCentroidData(pageName) {
	return {
  		type: 'FETCH_CENTROIDS',
  		//payload: axios.get(`data/withids.json`)
  		payload: axios.get(`data/centroids.json`) //TODO load from server to make json files consistent
	}
}

export function fetchPageLocation(pageName) {
	return {
  		type: 'FETCH_LOCATION',
  		payload: axios.get(`http://wikisep.toymaker.ops.fastforwardlabs.com/similars?title=${pageName}`) //TODO make environment
	}
}

export function hoveredOnMap(item) {
	return {
		type: 'HOVERED_ON_MAP',
		payload: item
	}
}

export function navigateToPage(pageName) {
	return {
  		type: 'NAVIGATE_TO_PAGE',
  		payload: pageName
	}
}

export function fetchWikiPage() {
	const pageName = store.getState().wikipage.pageTitle
	return {
  		type: 'FETCH_WIKIPAGE',
  		payload: axios.get(`https://en.wikipedia.org/w/api.php?action=parse&origin=*&format=json&page=${pageName}&contentmodel=wikitext&prop=text`)
	}
}

export function hoveredWikiLink(pageName) {
	return (dispatch) => {
		if(!pageName) {
			dispatch(hoverMapLocation())
		}
		else {
			axios.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${pageName}&redirects&origin=*`)
			.then((response) => {
				const json = response.data
				console.log(json)
				const pageTitle = (json.query.redirects && json.query.redirects.length) ?
				 					json.query.redirects[0].to :
				 					pageName
				axios.get(`http://wikisep.toymaker.ops.fastforwardlabs.com/similars?title=${pageTitle}`)
				.then((response) => {
					console.log('hover response', response.data.location)
					dispatch(hoverMapLocation(response.data.location))
				})
			})
		}
	}
}

export function hoverMapLocation(location) {
	return {
		type: 'HOVER_MAP_LOCATION',
		payload: location
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

export function setZoom(zoomLevel) {
	return {
		type: 'MAP_SET_ZOOM',
		payload: zoomLevel
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