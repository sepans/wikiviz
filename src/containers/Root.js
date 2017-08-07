import React, { Component } from 'react'
import { connect } from 'react-redux'
import { debounce } from 'lodash'
import * as actions from '../actions/'
import WikiPage from './WikiPage'
import Map from './Map'
import TopBanner from '../components/TopBanner'
import Modal from '../components/Modal'

const appName = 'Encartopedia'


class Root extends Component {


  	componentWillMount() {

      this.props.dispatch(actions.updateWindowSize({width: window.innerWidth, height: window.innerHeight}))
      const debouncedResize = debounce((dims) => {
        this.props.dispatch(actions.updateWindowSize(dims))
      }, 500)
      window.onresize = () => {
        debouncedResize({width: window.innerWidth, height: window.innerHeight})
      }
      


      const initialTitle = this.props.match.params.title || 'Cartography'
  		this.props.dispatch(actions.navigateToPage(initialTitle))
  		this.props.dispatch(actions.fetchWikiPage())

  		this.props.dispatch(actions.fetchTsneData())
      this.props.dispatch(actions.fetchCentroidData())
      this.props.dispatch(actions.fetchPageLocation(initialTitle))


      this.props.history.listen((location) => {
        //TODO this is so hacky!
        if(location) {
          const title = location.pathname.replace('/', '')
          this.props.dispatch(actions.navigateToPage(title))
          this.props.dispatch(actions.fetchPageLocation(title))
          this.props.dispatch(actions.fetchWikiPage())


        }

      })


  	}

    closeModal() {
      this.props.dispatch(actions.closeModal())
    }

    toggleExpand() {
      this.props.dispatch(actions.toggleExpand())
    }

	
  	render() {

      const showModal = this.props.wikipage.modal
      const expandModal = this.props.wikipage.expandModal

    	return (<div> 
          <TopBanner dispatch={this.props.dispatch} results={this.props.wikipage.wikiSearchResults} appName={appName}/>
          <div style={{padding: '10px 0 10px 25px',  width: '45%', display: 'inline-block'}}>
          	<WikiPage {...this.props}/>
          </div>
          <div style={{border: '1px solid #e5e55', float: 'right', margin: '10px 25px 0 0'}}>
          	<Map {...this.props}/>
          </div>
          <Modal showModal={showModal} 
                expandModal={expandModal}
                closeModal={this.closeModal.bind(this)} 
                toggleExpand={this.toggleExpand.bind(this)} appName={appName}/>
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