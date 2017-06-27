
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import Root from './containers/Root'
import store from './store'
import { BrowserRouter as Router, Route } from 'react-router-dom'

const app = document.getElementById('root')

ReactDOM.render(
        <Provider store={store}>
            <Router>
              <div>
                <Route path="/:title?" component={Root}/>
              </div>
            </Router>
				</Provider>, app)