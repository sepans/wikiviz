import { applyMiddleware, createStore } from 'redux'

import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import promise from 'redux-promise-middleware'
import { routerMiddleware } from 'react-router-redux'
import { createHashHistory } from 'history';

import rootReducer from './reducers/'

const dev = process.env.NODE_ENV === 'development'

const logger = createLogger({
  predicate: (getState, action) => action.type !== 'HOVERED_ON_MAP'
})

const middleware = dev ? 
					applyMiddleware(promise(), thunk, logger, routerMiddleware(createHashHistory())) :
					applyMiddleware(promise(), thunk, routerMiddleware(createHashHistory()))

const initialState = {
	map: {
	    tsneData: null,
	    fetching: false,
	    fetched: false,
	    error: [],
	    zoom: 1,
	    raycast: true,
	    wikiHistory: [],
	    mapReady: false
	},
	wikipage: {
		pageTitle: null,
		windowSize: {},
	    fetching: false,
	    fetched: false,
	    wikicontent: null,
	    wikiSearchResults: [],
	    error: [],
	    modal: true,
	    expandModal: false
	}

}

export default createStore(rootReducer, initialState, middleware)
