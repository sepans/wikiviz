import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions/'
import WikiPage from './WikiPage'
import Map from './Map'


class Root extends Component {
  	componentWillMount() {

      const initialTitle = this.props.match.params.title || 'Anarchism'
  		this.props.dispatch(actions.navigateToPage(initialTitle))
  		this.props.dispatch(actions.fetchWikiPage())

  		this.props.dispatch(actions.fetchTsneData())
      this.props.dispatch(actions.fetchPageLocation(initialTitle))

  	}

	
  	render() {
  		
    //   const wikiContent = this.props.wikipage.wikicontent
  		// const tsneData = this.props.map.tsneData
    //   const dispatch = this.props.dispatch
    //   const pageTitle = this.props.wikipage.pageTitle
    //   const location = this.props.map.location
    //   const neighbors = this.props.map.neighbors


    	return (<div> 
          <div style={{padding: 10, maxWidth: '700px', width: '45%', display: 'inline-block'}}>
          	<WikiPage {...this.props}/>
          </div>
          <div style={{border: '1px solid #e5e55', float: 'right'}}>
          	<Map {...this.props}/>
          </div>
        </div>)
  	}

}

function mapStateToProps(state) {
  return {
  	wikipage: state.wikipage,
  	map: state.map
  }
}

export default connect(mapStateToProps)(Root)