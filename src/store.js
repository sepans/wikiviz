import { applyMiddleware, createStore } from 'redux'

import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import promise from 'redux-promise-middleware'
import { routerMiddleware } from 'react-router-redux'
import { createBrowserHistory } from 'history';

import rootReducer from './reducers/'

const logger = createLogger({
  predicate: (getState, action) => action.type !== 'HOVERED_ON_MAP'
})

const middleware = applyMiddleware(promise(), thunk, logger, routerMiddleware(createBrowserHistory()))

const initialState = {
	map: {
	    tsneData: null,
	    fetching: false,
	    fetched: false,
	    error: [],
	    zoom: 1,
	    raycast: true,
	    wikiHistory: []
	},
	wikipage: {
		pageTitle: null,
	    fetching: false,
	    fetched: false,
	    wikicontent: null,
	    wikiSearchResults: [],
	    error: []
	}

}

export default createStore(rootReducer, initialState, middleware)
