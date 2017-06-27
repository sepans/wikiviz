import { combineReducers } from 'redux'

import wikipage from './wikipageReducer'
import map from './mapReducer'

export default combineReducers({
	wikipage,
	map
})