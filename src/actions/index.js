import axios from 'axios'
import store from '../store'
import { push } from 'react-router-redux'

const dev = process.env.NODE_ENV === 'development'
const API_ENDPOINT = dev ? 'http://localhost/api/' : '/api/'


export function updateWindowSize(dims) {
	return {
		type: 'UPDATE_WINDOW_SIZE',
		payload: dims
	}
}
export function fetchTsneData(pageName) {
	return {
  		type: 'FETCH_TSNE',
  		//payload: axios.get(`data/withids.json`)
  		payload: axios.get(`data/map.json`) //TODO load from server to make json files consistent
	}
}

export function fetchCentroidData(pageName) {
	return {
  		type: 'FETCH_CENTROIDS',
  		//payload: axios.get(`data/withids.json`)
  		payload: axios.get(`data/centroidWithName.json`) //TODO load from server to make json files consistent
	}
}

export function fetchPageLocation(pageName) {
	return {
  		type: 'FETCH_LOCATION',
  		payload: axios.get(`${API_ENDPOINT}similars?title=${pageName}`) //TODO make environment
	}
}

export function mapReady(pageName) {
	return {
		type: 'MAP_READY'
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

				axios.get(`${API_ENDPOINT}similars?title=${pageTitle}`)
				.then((response) => {
					console.log('hover response', response.data.location)
					dispatch(hoverMapLocation({title: pageTitle, location: response.data.location}))
				})
			})
		}
	}
}

export function searchForTitle(title) {
	return {
		type: 'SEARCH_WIKI_TITLE',
		payload: axios.get(`https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&list=search&srsearch=${title}&utf8=`)
	}
}

export function clearSearchResults() {
	return {
		type: 'CLEAR_WIKI_SEARCH'
	}
}

export function goToPageAllActions(pageName) {
	return (dispatch) => {
		dispatch(navigateToPage(pageName))
		dispatch(fetchPageLocation(pageName))
		dispatch(fetchWikiPage(pageName))
		dispatch(push(pageName))

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

export function cameraMoving(moving) {
	return {
		type: 'CAMERA_MOVING',
		payload: moving
	}
}

export function openModal() {
	return {
		type: 'OPEN_MODAL'
	}
}

export function closeModal() {
	return {
		type: 'CLOSE_MODAL'
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
				dispatch(goToPageAllActions(newPage))

			}
			else {
				dispatch(goToPageAllActions(pageName))

			}
		}) 
	}
}
