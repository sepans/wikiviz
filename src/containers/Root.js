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
      this.props.dispatch(actions.fetchCentroidData())
      this.props.dispatch(actions.fetchPageLocation(initialTitle))

      this.props.history.listen((location) => {
        console.log('history listener', location, this.props)
        //TODO this is so hacky!
        if(location) {
          const title = location.pathname.replace('/', '')
          this.props.dispatch(actions.navigateToPage(title))
          this.props.dispatch(actions.fetchPageLocation(title))
          this.props.dispatch(actions.fetchWikiPage())


        }

      })


  	}

    componentDidUpdate(prevProps, prevState) {
      // console.log('ROOT CHANGED!!!!!',prevProps.match, this.props.match)
      // if(this.props.match.params.title != prevProps.match.params.title) {
      //   console.log('TITLE CHANGED')
      // }
    }

	
  	render() {
  		

    	return (<div> 
          <div style={{padding: '10px 0 10px 25px', maxWidth: '700px', width: '45%', display: 'inline-block'}}>
          	<WikiPage {...this.props}/>
          </div>
          <div style={{border: '1px solid #e5e55', float: 'right', margin: '10px 25px 0 0'}}>
          	<Map {...this.props}/>
          </div>
        </div>)
  	}

}

function mapStateToProps(state, ownProps) {
  return {
  	wikipage: state.wikipage,
  	map: state.map,
    //match: ownProps.match
  }
}

export default connect(mapStateToProps)(Root)