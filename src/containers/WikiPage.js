import React, { Component } from 'react'
import * as actions from '../actions/'
import WikiStyles from '../components/WikiStyles'


export default class WikiPage extends Component {
    componentWillMount() {

    }

    addOnclickHandlerToWikiContent(content) {
      return content.replace(new RegExp('<a ', 'g'), '<a onclick="return false;" ')
    }
    


    wikiLinkClickedNotParsed(e) {
      console.log('clicked', e)
      const title = e.target.title
      console.log(title)
      //console.log('this.contentEl', this.contentEl)
      this.contentEl.scrollTop = 0
      if(title) {

        this.props.dispatch(actions.checkRedirectAndFetch(title))
        if(this.props.map.zoom!==11) {
          setTimeout(() => {
            this.props.dispatch(actions.zoomIn())
          }, 1000)
          
        }
        //this.props.history.push(`/${title}`) //TODO move this to action to push title returned by checkRedirectAndFetch
                                              // might need to switch to react-redux-router
      }
      return false;

    }
  
    render() {
      const {wikicontent, pageTitle} = this.props.wikipage
      const wikipediaStyles = {
         fontFamily: 'sans-serif',
         fontSize: '100%',
         maxHeight: window.innerHeight,
         overflowY: 'scroll'
      }
      return (
        <div style={wikipediaStyles} ref={(el) => { this.contentEl = el} } onWheel={e => { e.stopPropagation() }}>
          <WikiStyles />
          <h2 style={{fontFamily: "'Linux Libertine','Georgia','Times',serif", fontSize: '28px', fontWeight: 'normal'}}>{pageTitle}</h2>
          <div className="mw-body-content" onClick={this.wikiLinkClickedNotParsed.bind(this)}  style={{paddingRight: '20px'}}
              dangerouslySetInnerHTML={wikicontent ? {__html: this.addOnclickHandlerToWikiContent(wikicontent)} : {__html: '<span>loading...</span>'}}>
          </div>
        </div>
        )
          
    }

   
}

