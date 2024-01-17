import React, { Component } from 'react'
import { connect } from 'react-redux'
import { debounce } from 'lodash'
import * as actions from '../actions/'
import WikiPage from './WikiPage'
import Map from './Map'
import TopBanner from '../components/TopBanner'
import Modal from '../components/Modal'
import HistoryPanel from '../components/HistoryPanel'

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
       //this.props.dispatch(actions.fetchPageLocation(initialTitle))


  	}

    componentDidMount() {
      setTimeout(() => {
        this.props.dispatch(actions.closeModal())
      }, 15000)

      //for handling back btn
      window.onpopstate = this.onBackButtonEvent.bind(this)
    }

    onBackButtonEvent(e) {
        //console.log('back' , e, e.currentTarget.location.hash)
        const title = e.currentTarget.location.hash.replace('#/', '')
        
        console.log('EVENT!!!! onpopstate ', e, title, this.props.map.pageTitle)

        if(title !== this.props.map.pageTitle) {
          this.props.dispatch(actions.navigateToPage(title))
          // this.props.dispatch(actions.fetchPageLocation(title))
          this.props.dispatch(actions.fetchWikiPage())
        }


    }

    closeModal() {
      this.props.dispatch(actions.closeModal())
    }

    openModal() {
      this.props.dispatch(actions.openModal())
    }

    toggleExpand() {
      this.props.dispatch(actions.toggleExpand())
    }

	
  	render() {

      const showModal = this.props.wikipage.modal
      const expandModal = this.props.wikipage.expandModal

    	return (<div> 
          <TopBanner appName={appName} aboutClicked={this.openModal.bind(this)}/>
          <div className='content-container'>

            <div className='wiki-panel'>
              <WikiPage {...this.props}/>
            </div>
            <div className='map-panel'>
              <Map {...this.props}/>
            </div>
          </div>
          <HistoryPanel history={this.props.map.wikiHistory} />
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