
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import Root from './containers/Root'
import store from './store'
//import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Router, Route } from 'react-router'
import { createBrowserHistory } from 'history';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

const app = document.getElementById('root')

//const history = syncHistoryWithStore(browserHistory, store)
const history = syncHistoryWithStore(createBrowserHistory(), store);

ReactDOM.render(
        <Provider store={store}>
            <Router history={history}>
              <div>
                <Route path="/:title?" component={Root}/>
              </div>
            </Router>
				</Provider>, app)