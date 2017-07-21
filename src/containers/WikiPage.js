import React, { Component } from 'react'
import * as actions from '../actions/'
import WikiStyles from '../components/WikiStyles'
import { debounce } from 'lodash'


export default class WikiPage extends Component {
    constructor(props) {
      super(props)
      // this.debouncedMouseOverLink = (e) => {
      //   const title = e.target.title
      //   return debounce((e) => {console.log(e); this.mouseOverLink(e.target.title)}, 2000)
      // }
      this.debouncedMouseOverLink = debounce(this.handleHover, 500)//debounce(this.mouseOverLink, 2000)
      //console.log('WikiPage construction', this.debouncedMouseOverLink)
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
        //this.props.dispatch(actions.hoveredWikiLink())
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
      //console.log(e)
      //const title = e.target.title
      if(title) {
        this.props.dispatch(actions.hoveredWikiLink(title))
      }

    }

    mouseOutLink() {
      this.props.dispatch(actions.hoveredWikiLink())
    }
  
    render() {
      const {wikicontent, pageTitle} = this.props.wikipage
      const wikipediaStyles = {
         fontFamily: 'sans-serif',
         fontSize: '100%',
         maxHeight: window.innerHeight,
         overflowY: 'scroll'
      }
      //console.log('wikipage render', this.debouncedMouseOverLink)
      return (
        <div style={wikipediaStyles} ref={(el) => { this.contentEl = el} } onWheel={e => { e.stopPropagation() }}>
          <WikiStyles />
          <h2 style={{fontFamily: "'Linux Libertine','Georgia','Times',serif", fontSize: '28px', fontWeight: 'normal'}}>{pageTitle}</h2>
          <div className="mw-body-content" 
              onClick={(e) => this.wikiLinkClickedNotParsed(e)}
              onMouseOver={(e) => this.hoverOnLink(e)}
              onMouseOut={(e) => this.mouseOutLink(e)}
              style={{paddingRight: '20px'}}
              dangerouslySetInnerHTML={wikicontent ? {__html: this.addOnclickHandlerToWikiContent(wikicontent)} : {__html: '<span>loading...</span>'}}>
          </div>
        </div>
        )
          
    }

   
}

