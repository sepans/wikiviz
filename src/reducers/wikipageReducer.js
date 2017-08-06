const defualtState = {
    pageTitle: null,
    fetching: false,
    fetched: false,
    wikicontent: null,
    error: []
}

export default function reducer(state=defualtState, action) {
  switch(action.type) {
    case 'UPDATE_WINDOW_SIZE':
      return {...state, windowSize: action.payload}
    case 'NAVIGATE_TO_PAGE':
      return {...state, pageTitle: action.payload}
    case 'FETCH_WIKIPAGE_PENDING':
        console.log('fetch', state)
      return {...state, fetching: true}
    case 'FETCH_WIKIPAGE_FULFILLED':
      const content = action.payload.data.parse.text['*']
      return {...state, fetching: false, fetched: true, wikicontent: content}
    case 'FETCH_WIKIPAGE_REJECTED':
      return {...state, fetching: false, error: state.error.concat(action.payload)}
    case 'SEARCH_WIKI_TITLE_FULFILLED':
      const results = action.payload.data.query.search
      return {...state, wikiSearchResults: results}
    case 'CLEAR_WIKI_SEARCH': 
      return {...state, wikiSearchResults: []}
    case 'HOVERED_WIKILINK_LOADING':
      return {...state, hoveredWikiLinkLoading: true}
    case 'HOVERED_WIKILINK_LOADED':
      return {...state, hoveredWikiLinkLoading: false}
    case 'OPEN_MODAL': 
      return {...state, modal: true}
    case 'CLOSE_MODAL': 
      return {...state, modal: false}
    case 'TOGGLE_EXPAND_MODAL': 
      return {...state, expandModal: !state.expandModal}
    default:
      return state
  }

}

