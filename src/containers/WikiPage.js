import React, { Component } from 'react'
import * as actions from '../actions/'
import WikiStyles from '../components/WikiStyles'
import { debounce } from 'lodash'

import '../styles/WikiPage.css'

const NUMBER_OF_NEIGHBORS = 10

export default class WikiPage extends Component {
    constructor(props) {
      super(props)
      this.debouncedMouseOverLink = debounce(this.handleHover, 300)//debounce(this.mouseOverLink, 2000)
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
      if(!this.props.map.fetchingLocation) {
        this.activeDebounce = this.debouncedMouseOverLink(title)
      }
    }

    handleHover(title) {
      if(title) {
        this.props.dispatch(actions.hoveredWikiLink(title))
      }

    }

    mouseOutLink() {
      console.log('MOUSEOUTLINK')
      this.debouncedMouseOverLink.cancel()
      this.props.dispatch(actions.hoveredWikiLink())
    }

    shouldComponentUpdate() {
      //don't update wikipage while waiting for location api
      if(this.props.map.fetchingLocation) {
        return false;
      }
      return true;
    }
  
    render() {
      const {wikicontent, pageTitle} = this.props.wikipage

      const hoverLoding = this.props.wikipage.hoveredWikiLinkLoading
      const neighbors = this.props.map.neighbors
      const neighborItems = (neighbors || [])
          .slice(0, NUMBER_OF_NEIGHBORS)
          .filter(d => d.toLowerCase()!==pageTitle.toLowerCase())
          .map(d => (
            <li>
              <a title={d} 
                onClick={(e) => this.wikiLinkClickedNotParsed(e)}
                onMouseOver={(e) => this.hoverOnLink(e)}
                onMouseOut={(e) => this.mouseOutLink(e)}>
                  {d}
                </a>
            </li>
          ))

      const neighborsBlock = this.props.map.neighbors ? (<div className="neighborSection">
            <label>Semantic Neighbors:</label>
            <ul className="neighbors">
             {neighborItems}
            </ul>
          </div>) : <span/>

      const wikipediaOrgLink = pageTitle ? `https://en.wikipedia.org/wiki/${pageTitle.replace(/ /g,"_")}` : '#'

      return (
        <div className={`wikipediaStyles ${hoverLoding ? 'hoverLoading' : ''}`} style={{maxHeight: window.innerHeight}} ref={(el) => { this.contentEl = el} } onWheel={e => { e.stopPropagation() }}>
          <WikiStyles />
          <div>
            <h2 className="wikiHeader">{pageTitle}</h2>
            <span><a className="openOrg" href={wikipediaOrgLink} target="_blank">open in wikipedia.org →</a></span>
          </div>
          {neighborsBlock}
          <div className="mw-body-content"
              onClick={(e) => this.wikiLinkClickedNotParsed(e)}
              onMouseOver={(e) => this.hoverOnLink(e)}
              onMouseOut={(e) => this.mouseOutLink(e)}
              style={{paddingRight: '20px'}}
              dangerouslySetInnerHTML={wikicontent ? {__html: this.addOnclickHandlerToWikiContent(wikicontent)} : {__html: '<span>loading...</span>'}}/>
          
        </div>
        )
          
    }

   
}

