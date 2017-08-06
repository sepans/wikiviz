import React, { Component } from 'react'
import * as actions from '../actions/'
import WikiStyles from '../components/WikiStyles'
import { debounce } from 'lodash'

import '../styles/WikiPage.css'


export default class WikiPage extends Component {
    constructor(props) {
      super(props)
      this.debouncedMouseOverLink = debounce(this.handleHover, 200)//debounce(this.mouseOverLink, 2000)
    }

    componentDidMount() {
    }

    addOnclickHandlerToWikiContent(content) {
      return content.replace(new RegExp('<a ', 'g'), '<a onclick="return false;" ')
    }
    


    wikiLinkClickedNotParsed(e) {
      const title = e.target.title
      this.contentEl.scrollTop = 0
      if(title) {

        this.props.dispatch(actions.checkRedirectAndFetch(title))
        if(this.props.map.zoom!==11) {
          setTimeout(() => {
            this.props.dispatch(actions.zoomIn())
          }, 200)
          
        }
      }
      return false;

    }

    hoverOnLink(e) {
      const title = e.target.title
      this.debouncedMouseOverLink(title)
    }

    handleHover(title) {
      if(title) {
        this.props.dispatch(actions.hoveredWikiLink(title))
      }

    }

    mouseOutLink() {
      this.props.dispatch(actions.hoveredWikiLink())
    }
  
    render() {
      const {wikicontent, pageTitle} = this.props.wikipage

      const hoverLoding = this.props.wikipage.hoveredWikiLinkLoading

      return (
        <div className="wikipediaStyles" style={{maxHeight: window.innerHeight}} ref={(el) => { this.contentEl = el} } onWheel={e => { e.stopPropagation() }}>
          <WikiStyles />
          <span className="glitch">testing glitch</span>
          <h2 style={{fontFamily: "'Linux Libertine','Georgia','Times',serif", fontSize: '28px', fontWeight: 'normal'}}>{pageTitle}</h2>
          <div className={`mw-body-content ${hoverLoding ? 'hoverLoading' : ''}`}
              onClick={(e) => this.wikiLinkClickedNotParsed(e)}
              onMouseOver={(e) => this.hoverOnLink(e)}
              onMouseOut={(e) => this.mouseOutLink(e)}
              style={{paddingRight: '20px'}}
              dangerouslySetInnerHTML={wikicontent ? {__html: this.addOnclickHandlerToWikiContent(wikicontent)} : {__html: '<span>loading...</span>'}}/>
          
        </div>
        )
          
    }

   
}

