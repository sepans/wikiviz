import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import wikipage from './wikipageReducer'
import map from './mapReducer'

export default combineReducers({
	wikipage,
	map,
	routing: routerReducer
})