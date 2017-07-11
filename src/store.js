import { applyMiddleware, createStore } from 'redux'

import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import promise from 'redux-promise-middleware'

import rootReducer from './reducers/'

const logger = createLogger({
  predicate: (getState, action) => action.type !== 'HOVERED_ON_MAP'
})

const middleware = applyMiddleware(promise(), thunk, logger)

const initialState = {
	map: {
	    tsneData: null,
	    fetching: false,
	    fetched: false,
	    error: [],
	    zoom: 1,
	    raycast: false
	},
	wikipage: {
		pageTitle: null,
	    fetching: false,
	    fetched: false,
	    wikicontent: null,
	    error: []
	}

}

export default createStore(rootReducer, initialState, middleware)
