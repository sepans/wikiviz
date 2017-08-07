import React, { Component } from 'react'
import '../styles/SearchBar.css'
import { debounce } from 'lodash'
import * as actions from '../actions/'


export default class SearchBar extends Component {

    constructor(props) {
      super(props)
      this.debouncedSearch = debounce(this.search, 700)//debounce(this.mouseOverLink, 2000)
    }

	search(title) {
		if(title) {
			this.props.dispatch(actions.searchForTitle(title))
		}
		else {
			this.props.dispatch(actions.clearSearchResults())
		}
	}    

	searchChanged (e) {
		//console.log(e.target.value)
		this.debouncedSearch(e.target.value)
	}

	goToArticle(title) {
		console.log(title)
		this.props.dispatch(actions.goToPageAllActions(title))
		this.props.dispatch(actions.clearSearchResults())

	}

	render() {
		const results = this.props.results
		const resultEls = results.slice(0,4).map((d, i) => {
			return (<li onClick={(e) => {this.goToArticle(d.title)}}>
						<div className="searchTitle">{d.title}</div>
						<div className="searchDesc" dangerouslySetInnerHTML={{__html: d.snippet}}></div>
					</li>)
		})
		return (
				<span className="search">
					<input onChange={(e) => this.searchChanged(e)} placeholder=" → Go To"></input>
					<ul className="searchResults">
						{(resultEls)}
					</ul>
				</span>
			)
	}
}
