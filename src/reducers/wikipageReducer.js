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
      //TODO: move this somewhere better
      //const content = action.payload.data//Object.values(action.payload.data.query.pages)[0].revisions[0]['*']
      //console.log(action.payload.data)
      const content = action.payload.data.parse.text['*']
      return {...state, fetching: false, fetched: true, wikicontent: content}
    case 'FETCH_WIKIPAGE_REJECTED':
      return {...state, fetching: false, error: state.error.concat(action.payload)}
    case 'SEARCH_WIKI_TITLE_FULFILLED':
      const results = action.payload.data.query.search
      console.log('search results', results)
      return {...state, wikiSearchResults: results}
    case 'CLEAR_WIKI_SEARCH': 
      return {...state, wikiSearchResults: []}
    default:
      return state
  }

}

