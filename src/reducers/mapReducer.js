const defualtState = {
    tsneData: null,
    fetching: false,
    fetched: false,
    error: [],
    zoom: 1
}

export default function reducer(state=defualtState, action) {
  switch(action.type) {
    case 'NAVIGATE_TO_PAGE':
      return {...state, pageTitle: action.payload}
    case 'FETCH_TSNE_PENDING':
      return {...state, fetching: true}
    case 'FETCH_TSNE_FULFILLED':
      //TODO: move this somewhere better
      const content = Object.values(action.payload.data)//Object.values(action.payload.data.query.pages)[0].revisions[0]['*']
      return {...state, fetching: false, fetched: true, tsneData: content}
    case 'FETCH_TSNE_REJECTED':
      return {...state, fetching: false, error: state.error.concat(action.payload)}

    case 'FETCH_CENTROIDS_PENDING':
      return {...state, fetching: true}
    case 'FETCH_CENTROIDS_FULFILLED':
      //TODO: move this somewhere better
      return {...state, fetching: false, fetched: true, centroidsData: action.payload.data}
    case 'FETCH_CENTROIDS_REJECTED':
      return {...state, fetching: false, error: state.error.concat(action.payload)}

    // case 'FETCH_TSNE_PENDING':
    //     console.log('fetch', state)
    //   return {...state, fetching: true}
    case 'FETCH_LOCATION_FULFILLED':
      //TODO: move this somewhere better
      const location = action.payload.data.location//Object.values(action.payload.data.query.pages)[0].revisions[0]['*']
      const neighbors = action.payload.data.nn
      const wikiHistory = state.wikiHistory || []
      wikiHistory.push({
        x: location[0],
        y: location[1],
        title: state.pageTitle 
      })
      return {...state, /*fetching: false, fetched: true,*/ location: location, neighbors: neighbors, wikiHistory: wikiHistory}
    case 'FETCH_LOCATION_REJECTED':
      return {...state, fetching: false, error: state.error.concat(action.payload)}
    case 'MAP_ZOOM_IN':
      return {...state, zoom: 11/*Math.min(state.zoom + 10, 30)*/, raycast: true}
    case 'MAP_ZOOM_OUT':
      return {...state, zoom: 1/*Math.max(state.zoom - 10, 1)*/, raycast: true}
    case 'MAP_SET_ZOOM':
      return {...state, zoom: action.payload/*Math.max(state.zoom - 10, 1)*/, raycast: true}
    case 'HOVERED_ON_MAP': 
      return {...state, hoveredItem: action.payload}
    case 'HOVER_MAP_LOCATION':
      return {...state, wikiHover: action.payload}
    case 'MAP_READY':
      return {...state, mapReady: true}
    case 'CAMERA_MOVING':
      return {...state, cameraMoving: action.payload}
    default:
      return state
  }

}