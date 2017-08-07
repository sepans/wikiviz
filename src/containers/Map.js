import React, { Component } from 'react'
import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { extent, mean } from 'd3-array'
import { rgb } from 'd3-color'
import { voronoi } from 'd3-voronoi'
import { polygonHull, polygonCentroid } from 'd3-polygon'
import * as actions from '../actions/'
import { debounce } from 'lodash'
import ArrowLabel from '../components/ArrowLabel'
import SearchBar from '../components/SearchBar'

import THREE from 'three'
//import OrbitControls  from 'three-orbitcontrols'
import TWEEN from 'tween.js'

import '../styles/Map.css'





//const OrbitControls = require('three-orbit-controls')(THREE)
const HIGHLIGHT_Z = -1530
const NODES_Z = -1530
const CAMERA_Z = 6500
const ZOOM_MIN_Z = -1200,
      ZOOM_MAX_Z = 7100,
      ZOOM_CAMERA_TILT_X = 0.25
const PARTICLE_SIZE = 10

const pageToCanvasWidthRatio = 0.48,
	  pageToCanvasHeightRatio = 0.9
	



const getX = d => d.x
const getY = d => d.y

export default class Map extends Component {


	constructor(props)	{
		
		super(props)

		if(!this.debouncedNoHover) {
		    
		    this.debouncedNoHover = debounce(() => {
		    	this.props.dispatch(actions.hoveredOnMap(null))

		    }, 100)

		}
	    if(!this.debouncedSetZoom) {
		    this.debouncedSetZoom = debounce((level) => {
		    	this.props.dispatch(actions.setZoom(level))
		    	if(this.props.map.cameraMoving) {
	    		
	    			this.props.dispatch(actions.cameraMoving(false))
	    		}

		    }, 500)

	    }
	}

	componentDidMount() {

	}

	init() {
		const tsneData = this.props.map.tsneData

		this.youarehere = []
		this.sprites = []

		let container
		let camera, scene, renderer;
		//let pickingData = [], pickingTexture, pickingScene;
		this.mouse = new THREE.Vector2()
		this.mouseStart = new THREE.Vector2()

		const width = this.props.wikipage.windowSize.width * pageToCanvasWidthRatio// window.innerWidth * 0.48//Math.min(window.innerWidth * 0.45, window.innerHeight)
		const height =  this.props.wikipage.windowSize.height * pageToCanvasHeightRatio// width

		//TODO move to redux store

		container = this.refs.threejs
		const SCALE_UNIVERSE_FACTOR = 4

		this.x = scaleLinear().range([- SCALE_UNIVERSE_FACTOR * width, SCALE_UNIVERSE_FACTOR * width])
		this.y= scaleLinear().range([-SCALE_UNIVERSE_FACTOR * height, SCALE_UNIVERSE_FACTOR * height])
		
		this.x.domain(extent(tsneData, getX))
		this.y.domain(extent(tsneData, getY))

		this.colorScale = scaleOrdinal()
			// .range(["rgb(33,240,182)", "rgb(28,135,92)", "rgb(148,211,188)", "rgb(21,114,156)",
			//  "rgb(131,172,243)", "rgb(135,17,172)", "rgb(142,128,251)", "rgb(105,48,110)", 
			//  "rgb(248,134,191)", "rgb(25,69,197)", "rgb(253,63,190)", "rgb(63,22,249)", "rgb(177,230,50)",
			//  "rgb(58,166,9)", "rgb(83,242,89)", "rgb(110,57,13)", "rgb(221,192,189)", "rgb(237,75,4)",
			//  "rgb(142,16,35)", "rgb(222,138,44)", "rgb(71,74,9)", "rgb(234,214,36)", "rgb(124,136,105)",
			//  "rgb(254,29,102)", "rgb(168,119,124)"])
			.range(['#ffffff','#f0f0f0','#d9d9d9','#bdbdbd','#969696','#737373','#525252','#252525','#000000'])

		this.colorScaleBackground = scaleOrdinal()
			.range(["rgb(33,240,182)", "rgb(28,135,92)", "rgb(148,211,188)", "rgb(21,114,156)",
			 "rgb(131,172,243)", "rgb(135,17,172)", "rgb(142,128,251)", "rgb(105,48,110)", 
			 "rgb(248,134,191)", "rgb(25,69,197)", "rgb(253,63,190)", "rgb(63,22,249)", "rgb(177,230,50)",
			 "rgb(58,166,9)", "rgb(83,242,89)", "rgb(110,57,13)", "rgb(221,192,189)", "rgb(237,75,4)",
			 "rgb(142,16,35)", "rgb(222,138,44)", "rgb(71,74,9)", "rgb(234,214,36)", "rgb(124,136,105)",
			 "rgb(254,29,102)", "rgb(168,119,124)"])
	
		this.colorScale.domain([0, 480])

		camera = new THREE.PerspectiveCamera( 45, width / height, 1, 10000 );
		camera.position.set(0 , 0, CAMERA_Z);

		scene = new THREE.Scene();
		// let light = new THREE.DirectionalLight( 0xffffff, 1 );
		// light.position.set( 1, 1, 1 ).normalize();
		// scene.add( light );

		let light = new THREE.AmbientLight( 0x666666 );
		scene.add( light );

		const geometry = new THREE.BoxBufferGeometry( 4, 4, 4 );
		//points
		const pointsGeometry = new THREE.Geometry()
		const pointsContainer = new THREE.Object3D()

		for ( var i = 0; i < tsneData.length; i ++ ) {
			const color = this.colorScale(tsneData[i].d)
			

			var vertex = new THREE.Vector3();
			vertex.x = this.x(getX(tsneData[i]))
			vertex.y = this.y(getY(tsneData[i]))
			vertex.z = NODES_Z
			//console.log(vertex)
			pointsGeometry.vertices.push(vertex)
			const rgbColor = rgb(color)//hsl(tsneData[i].d/500 * 256, 0.7, 0.7).rgb()
			const nodeColor = new THREE.Color().setRGB(rgbColor.r/ 255, rgbColor.g/255, rgbColor.b/255)
			//if(i===0)
			pointsGeometry.colors.push(nodeColor)
			// if(i===0) {
			// 	this.articleStartingId = object.id
			// }
			//scene.add( object );
		}
		const sprite = new THREE.TextureLoader().load( 'img/hex.png')
		const material = new THREE.PointsMaterial( { 
			size: PARTICLE_SIZE, 
			map: sprite,
			vertexColors: THREE.VertexColors, 
			depthTest: false,
			/*sizeAttenuation: false,*/ 
			opacity: 1,  
			transparent: true 
		})

		//material.color.setRGB(.5, .5, .5)

		const points = new THREE.Points(pointsGeometry, material) //points ~ particles

		pointsContainer.add(points)
		scene.add(pointsContainer)

	
		this.raycaster = new THREE.Raycaster();
		this.raycaster.params.Points.threshold = 5
		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor( 0xffffff );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( width, height );
		renderer.sortObjects = false;




		if(container.hasChildNodes()) {
			//debugger;
			container.removeChild(container.firstChild)
		}

		container.appendChild( renderer.domElement );



		this.renderer = renderer
		//this.controls = controls
		this.scene = scene
		this.camera = camera
		this.geometry = geometry

		console.log(this.props)
		if(this.props.map.location && this.props.map.neighbors) {
			console.log('what is this??!?!?!?!?!?!?!?!?!?!?!')
			this.updateNeighbors = true //? needed

		}

		this.props.dispatch(actions.mapReady())

		this.animate()
	}

	mouseClicked(e) {
		console.log('mouse clicked', this.mouseDown)
		if(this.intersected) {
			if (this.props.map.zoom > 7) {
				const id = this.intersected.index

				const tsneIndex = id //- this.articleStartingId
				if(!tsneIndex) {
					console.log('no tsneindex',  this.intersected)
					return
				}
				const title = this.props.map.tsneData[tsneIndex].title
				console.log('title', title)

				this.props.dispatch(actions.checkRedirectAndFetch(title))
				

			}
			else {

				const mouse3 = new THREE.Vector3(this.mouse.x, this.mouse.y, NODES_Z)

				mouse3.unproject( this.camera );

				const dir = mouse3.sub( this.camera.position ).normalize();

				const distance = - this.camera.position.z / dir.z;

				const pos = this.camera.position.clone().add( dir.multiplyScalar( distance ) );
				console.log(pos)	
				const clusterZ = -500
				this.tweenCamera({x: pos.x, y: pos.y, z: -500}, {}, () => {
					const zoomLevel = 10 -  Math.round((clusterZ /  (ZOOM_MAX_Z - ZOOM_MIN_Z) * 10) * 10) / 10
					this.props.dispatch(actions.setZoom(zoomLevel))
				})			
			}
		}
	}


	drawVoronoi() {
		const centroids = this.props.map.centroidsData

		const voro = voronoi()
			.x(d => d[0])
			.y(d => d[1])

		//code from https://bl.ocks.org/Fil/711834f9dc943d1de9c9577b10a7a872 to limit voronois
		var links = voro.links(centroids)
		   
		var ext = mean(links, function(l) {
		    var dx = l.source[0] - l.target[0],
		        dy = l.source[1] - l.target[1];
		      return Math.sqrt(dx*dx + dy*dy);
		});
		   

		var convex = polygonHull(centroids);
		    convex.centroid = polygonCentroid(convex);
		  	convex = convex.map(function(p){
		    	var dx = p[0] - convex.centroid[0],
		      	dy = p[1] - convex.centroid[1],
		      	angle = Math.atan2(dy, dx);
		    	return [p[0] + Math.cos(angle) * ext, p[1] + Math.sin(angle) * ext];
		  });

		var centroids2 = centroids.slice(); // clone
		for (var i = 0; i < convex.length; i++) {
		    var n = convex[i], m = convex[i+1]||convex[0]; 
		    var dx = n[0] - m[0],
		        dy = n[1] - m[1],
		        dist = Math.sqrt(dx * dx + dy * dy);
		    var pts = Math.ceil(dist / 2 / ext);
		    for(var j=0; j <= pts; j++) {
		      var p = [m[0] + dx *j / pts, m[1] + dy * j / pts];
		      p.artificial = 1;
		      centroids2.push(p);
		    }
		}			

		this.polygons = voro.polygons(centroids2)
		

		this.polygons.forEach((polygon, indx) => {
			//const polyData = polygon.data
			if(indx > centroids.length) {
				return
			}
			polygon = polygon.filter(d => d)
			
			const voroShape = new THREE.Shape();
			for(let i=0 ; i< polygon.length ; i++) {
				const x = this.x(polygon[i][0])
				const y = this.y(polygon[i][1])
				if (i === 0) {
				    voroShape.moveTo(x, y, NODES_Z);
				} else {
				    voroShape.lineTo(x, y, NODES_Z);
				}
			}
			voroShape.autoClose = true
			const voroGeo = voroShape.makeGeometry()
			voroGeo.vertices.forEach(vertice => {
				vertice.setZ(NODES_Z)
			})
			const material = new THREE.MeshBasicMaterial({
				shading: THREE.FlatShading,
				color: this.colorScaleBackground(indx + 1),
				transparent: true,
				opacity:  0.02,
				side: THREE.FrontSide 
			});

		  	const mesh = new THREE.Mesh( voroGeo, material );
			this.scene.add( mesh );
			if(indx===0) {
				this.firstVoronoiId = mesh.id
				//console.log('vorous', mesh.id, polygon)
			}
			//this.meshIdToCentroidId[mesh.id] = polyData.i


		})
		
	

		//var points = curve.getSpacedPoints( 20 );

	}
	/*
	drawVoronoiBoundry(clusterId) {
		if(clusterId > -1) {
			const polygon = this.polygons[clusterId].filter(d => d)
			let points = []
			for(let i=0 ; i< polygon.length - 1 ; i++) {
			 	const curve = new THREE.CubicBezierCurve3(
					new THREE.Vector3( polygon[i][0], polygon[i][1], NODES_Z ),
					new THREE.Vector3( polygon[i][0], polygon[i][1], NODES_Z ),
					new THREE.Vector3( polygon[i + 1][0], polygon[i + 1][1], NODES_Z ),
					new THREE.Vector3( polygon[i + 1][0], polygon[i + 1][1], NODES_Z ),
				);
			 	points = points.concat(curve.getSpacedPoints( 5 ))

			 }

			const path = new THREE.Path();
			const historyLineGeometry = path.createGeometry( points );
			  
			historyLineGeometry.dynamic = true
			const lineMaterial = new THREE.LineBasicMaterial({
		        color: 0x000000,
		        opacity: 0.2,
		        transparent: true
		    });


			this.clusterBorder = new THREE.Line(historyLineGeometry, lineMaterial);
			this.scene.add(this.clusterBorder);			
		}
		else if(this.clusterBorder) {
			this.clusterBorder.material.opacity = 0
		}
		
	}
	*/

	showRemoveHover() {
		const hoverLocation = this.props.map.wikiHover ? this.props.map.wikiHover.location : null
		const curLocation = this.props.map.location
		if(hoverLocation) {
			let points = []

		 	const distance = this.calculateDistance(curLocation, hoverLocation)
		 	const curve = new THREE.CubicBezierCurve3(
				new THREE.Vector3( this.x(curLocation[0]), this.y(curLocation[1]), NODES_Z ),
				new THREE.Vector3( this.x((curLocation[0] + hoverLocation[0]) * 0.5), this.y((curLocation[1] + hoverLocation[1])  * 0.5) , NODES_Z + distance/2),
				new THREE.Vector3( this.x((curLocation[0] + hoverLocation[0]) * 0.5), this.y((curLocation[1] + hoverLocation[1])  * 0.5) , NODES_Z + distance/2),
				new THREE.Vector3( this.x(hoverLocation[0]), this.y(hoverLocation[1]), NODES_Z)
			);
		 	points = points.concat(curve.getSpacedPoints( 20 ))

			const path = new THREE.CatmullRomCurve3( points );
			const hoverLineGeometry = new THREE.TubeGeometry(
        		path,
        		64,
        		2
    		)
			  
			hoverLineGeometry.dynamic = true
			var material = new THREE.MeshLambertMaterial({
		        color: 0x000000,
		        transparent: true,
		        opacity: 0.55,
		        // linewidth: 100,
		        //fog: true
		    });

			    // Create the final Object3d to add to the scene
			 if(!this.hoverLineObject) {
				 this.hoverLineObject = new THREE.Mesh(hoverLineGeometry, material);
				 this.hoverLineObject.receiveShadow = false

				 this.scene.add(this.hoverLineObject);

			 }
			 else {
			 	this.hoverLineObject.geometry = hoverLineGeometry
			 	this.hoverLineObject.material.opacity = 0.55
			 }

			const xDistance = Math.abs(this.x(hoverLocation[1]) - this.x(curLocation[1]))
			const yDistance = Math.abs(this.y(hoverLocation[1]) - this.y(curLocation[1]))
			const maxDistance = Math.max(xDistance, yDistance, distance)
			const vFOV = this.camera.fov * Math.PI / 180
			const zOffset = Math.tan( vFOV / 2) * maxDistance * 6
			const cameraZ = this.camera.position.z + zOffset
			this.prevCameraZ = this.camera.position.z
			this.prevCameraTilt = this.camera.rotation._x

			// const midpoint = {x: this.x((location[0] + prevLocation[0])/2), y: this.y((location[1] + prevLocation[1])/2) - CAMERA_Y_OFFSET, z: cameraZ, fov: 50}
			// const time = 500 + 2 * (distance * 2000) / MAX_DISTANCE
			if (zOffset > (this.camera.position.z - NODES_Z)) {
				this.tweenCamera({z: cameraZ, _x: 0}, {tween: TWEEN.Easing.Exponential.Out, time: 250}, () => {	
				})	
			}
					 

		}
		else if(this.hoverLineObject) {
			//console.log(this.hoverLineObject)
			this.hoverLineObject.material.opacity = 0
			if(this.prevCameraZ) {
				this.tweenCamera({z: this.prevCameraZ, _x: this.prevCameraTilt}, {tween: TWEEN.Easing.Exponential.Out, time: 250})
			}
			this.prevCameraZ = null
		}

	}

	drawHistory() {

		const history = this.props.map.wikiHistory
		if(history.length < 2) {
		 	return
		}

		console.log('DRWAING HISTORY')
		
		let points = []

		for(let i=0 ; i< history.length -1 ; i++) {
		 	const distance = this.calculateDistance([history[i].x, history[i].y], [history[i + 1].x, history[i + 1].y])
		 	const curve = new THREE.CubicBezierCurve3(
				new THREE.Vector3( this.x(history[i].x), this.y(history[i].y), NODES_Z ),
				new THREE.Vector3( this.x((history[i].x + history[i + 1].x) * 0.5), this.y((history[i].y + history[i + 1].y) * 0.5) , NODES_Z + distance/2),
				new THREE.Vector3( this.x((history[i].x + history[i + 1].x) * 0.5), this.y((history[i].y + history[i + 1].y) * 0.5) ,  NODES_Z + distance/2),
				new THREE.Vector3( this.x(history[i + 1].x), this.y(history[i + 1].y), NODES_Z)
			);
		 	points = points.concat(curve.getSpacedPoints( 20 ))

		}

		const path = new THREE.CatmullRomCurve3( points );
		const historyTubeGeometry = new THREE.TubeGeometry(
    		path,
    		64,
    		1.5
		)
		  
		historyTubeGeometry.dynamic = true
		var material = new THREE.MeshLambertMaterial({
	        color: 0x000000,
	        transparent: true,
	        // linewidth: 100,
	        opacity: 0.85,
	        //fog: true
	    });

		    // Create the final Object3d to add to the scene
		if(!this.historyObject) {
			 this.historyObject = new THREE.Mesh(historyTubeGeometry, material);
			 this.historyObject.receiveShadow = false

			 this.scene.add(this.historyObject);
		}
		else {
		 	this.historyObject.geometry = historyTubeGeometry
		}

		

	}	

	componentDidUpdate(prevProps) {

		if(prevProps.map.tsneData==null && this.props.map.tsneData!=null) {
			//this.addBoxes(nextProps.tsneData)
			this.init()
			//this.renderer.render( this.scene, this.camera );

		}
		
		if((prevProps.map.centroidsData===null && this.props.map.centroidsData!==null && this.props.map.tsneData) ||
		   (prevProps.map.tsneData===null && this.props.map.tsneData!==null && this.props.map.centroidsData)) {
			//this.addBoxes(nextProps.tsneData)
			this.drawVoronoi()
			//this.renderer.render( this.scene, this.camera );

		}
		if(prevProps.map.wikiHover!== this.props.map.wikiHover) {
			this.showRemoveHover()
		}

		if((prevProps.wikipage.windowSize.width!== this.props.wikipage.windowSize.width || 
			prevProps.wikipage.windowSize.height!== this.props.wikipage.windowSize.height) && 
			this.props.map.tsneData) {
			this.init()
		}

	}

	componentWillReceiveProps(nextProps) {
		const location = nextProps.map.location
		const prevLocation = this.props.map.location
		const CAMERA_Y_OFFSET = 50
		if(this.locationChanged(this.props.map.location, nextProps.map.location)) {
			console.log('UPDATING neighbors')
			//this.addNeighbors(nextProps.map.location, nextProps.map.neighbors, nextProps.wikipage.pageTitle)
			this.updateNeighbors = true;
			this.drawHistory()
		}
		if(this.props.map.zoom !== nextProps.map.zoom && (nextProps.map.zoom===11 || nextProps.map.zoom===1)) {
			//zoom btns clicked
			const nextCameraProps = nextProps.map.zoom===11 ? 
			{
				x: this.x(location[0]),
				y: this.y(location[1]) - CAMERA_Y_OFFSET,
				z: HIGHLIGHT_Z + 600,
				fov: 60,
				_x: ZOOM_CAMERA_TILT_X,
				_y: 0.0,
				_z: 0.0
			} : 
			{
				x:  0,
				y: 0,
				z: CAMERA_Z,
				fov: 40,
				_x: 0.0,
				_y: 0.0,
				_z: 0.0
			}
			this.tweenCamera(nextCameraProps)

		}
		else if(this.props.map.zoom===11 && this.locationChanged(this.props.map.location, nextProps.map.location)) {
			//location changed
			const distance = this.calculateDistance(prevLocation, location)
			const MAX_DISTANCE = this.x.domain()[1] - this.x.domain()[0]
			const vFOV = this.camera.fov * Math.PI / 180
			const zOffset = Math.tan( vFOV / 2) * distance
			const cameraZ = zOffset < (this.camera.position.z - NODES_Z) ? this.camera.z : (this.camera.position.z + zOffset) 

			const midpoint = {x: this.x((location[0] + prevLocation[0])/2), y: this.y((location[1] + prevLocation[1])/2) - CAMERA_Y_OFFSET, z: cameraZ, fov: 50}
			const time = 200 + 2 * (distance * 1500) / MAX_DISTANCE
			
			this.props.dispatch(actions.cameraMoving(true))
			this.tweenCamera(midpoint, {tween: TWEEN.Easing.Exponential.Out, time: time/2}, () => {
				
				const nextCameraProps = 
					{
						x: this.x(location[0]),
						y: this.y(location[1]) - CAMERA_Y_OFFSET,
						z: HIGHLIGHT_Z + 600,
						fov: 60,
						_x: ZOOM_CAMERA_TILT_X,
						_y: 0.0,
						_z: 0.0
					} 
				this.tweenCamera(nextCameraProps, {tween: TWEEN.Easing.Exponential.In, time: time/2})
				
			})
	
			
		}
	}

	tweenCamera(to, options, done) {
			this.props.dispatch(actions.cameraMoving(true))
			options = options || {}
			options.time = options.time || 700
			options.easing = options.easing || TWEEN.Easing.Linear.None
			const from = {
					x: this.camera.position.x,
					y: this.camera.position.y,
					z: this.camera.position.z,
					fov: this.camera.fov,
					_x: this.camera.rotation._x,
					_y: this.camera.rotation._y,
					_z: this.camera.rotation._z

				}
			
			const that = this
 			new TWEEN.Tween(from)
	            .to(to, options.time)
	            .easing(options.easing)
	            .onUpdate(function () {
		            that.camera.position.setZ(this.z)
		            const position = {
		            	x: this.x || that.camera.position.x,
		            	y: this.y || that.camera.position.y,
		            	z: this.z || that.camera.position.z
		            }
		            const rotation = {
		            	_x: this._x || that.camera.rotation._x,
		            	_y: this._y || that.camera.rotation._y,
		            	_z: this._z || that.camera.rotation._z
		            }
		            that.camera.position.set(position.x, position.y, position.z)
		            that.camera.rotation.set(rotation._x, rotation._y, rotation._z)

	        })
	        .onComplete(() => {
	        	console.log('zoom out completed')
	        	setTimeout(() => {
	        		this.props.dispatch(actions.cameraMoving(false))
	        	}, 100)
	        	
	        	if(done) {
	        		done()
	        	}
	            
	        })
	        .start();				

	}

	locationChanged(oldLoc, newLoc) {
		if(oldLoc==null && newLoc!=null) {
			return true
		}
		else if(oldLoc && newLoc && oldLoc.length!==newLoc.length) {
			return true
		}
		else if(oldLoc && newLoc && (oldLoc[0]!==newLoc[0] || oldLoc[1]!==newLoc[1]) ) {
			return true
		}
		return false;

	}
	 
	animate() {

		requestAnimationFrame(() => this.animate() );
		//console.log(this.camera.rotation)
		this.renderThree();
		//stats.update();

	}

	calculateDistance(point1, point2) {
		const dy = this.y(point2[1]) - this.y(point1[1])
		const dx = this.x(point2[0]) - this.x(point1[0])
		return Math.sqrt( Math.pow( dx, 2) + Math.pow( dy, 2))
	}
	
	renderThree() {
	 	//console.log('.')
		//this.controls.update(  );
		const width = this.props.wikipage.windowSize.width * pageToCanvasWidthRatio// window.innerWidth * 0.48//Math.min(window.innerWidth * 0.45, window.innerHeight)
		const height =  this.props.wikipage.windowSize.height * pageToCanvasHeightRatio// width
	
		
		TWEEN.update()
		
		if(this.props.map.raycast && !this.props.map.cameraMoving) {
			//console.log('raycasting')
			this.raycaster.params.Points.threshold = this.props.map.zoom > 8 ? 5 : 30
			this.raycaster.setFromCamera( this.mouse, this.camera );
			var intersects = this.raycaster.intersectObjects( this.scene.children, true );
			if ( intersects.length > 0) {
				let i = 0
				let intersectedObject = intersects[i]
				//console.log(intersectedObject)
				while(i < intersects.length && intersectedObject.object.type==='Sprite') {
					i++
					intersectedObject = intersects[i]
				}
				
				if(intersectedObject && this.props.map.tsneData) {
					if(intersectedObject.index ) {
						//all points have inde -> points
						const tsneIndex = intersectedObject.index
						const hoveredItem = this.props.map.tsneData[tsneIndex]
						const materialColor = intersectedObject.object.geometry.colors[tsneIndex]
						
						this.intersected = intersectedObject

						if(this.props.map.zoom > 7) {
							if(materialColor) {
								//materialColor.setRGB(0, 0, 1)
								intersectedObject.object.geometry.colorsNeedUpdate = true
								//console.log(tsneIndex, hoveredItem.title, )
								hoveredItem.mousex = (this.mouse.x + 1)/2 * width + 8
								hoveredItem.mousey = - (this.mouse.y - 1)/2 * height - 5
								const prevHoveredItem = this.props.map.hoveredItem
								if(!prevHoveredItem || prevHoveredItem.title !== hoveredItem.title) {
									this.props.dispatch(actions.hoveredOnMap(hoveredItem))
								}


							}
							else {
								console.log('no materialColor', intersectedObject)
							}
						}
						else if(intersectedObject.index > this.props.map.tsneData.length) {
							console.log('what object is this? ', intersectedObject.index)
						}


					}

					else if(intersectedObject.object.id) {
						//meshes have object.id -> polygons
						if(!intersectedObject.object.material.emissive) { //TODO: needed?
							if(this.props.map.zoom < 8 ) {
								const mousex = (this.mouse.x + 1)/2 * width + 8
								const mousey = - (this.mouse.y - 1)/2 * height - 5
								//this.drawVoronoiBoundry(-1)
								if(this.voronoiHover && 
									this.voronoiHover.object.id!==intersectedObject.object.id) {
									if(this.voronoiHover.object.material) {

										this.voronoiHover.object.material.opacity = 0.02
									}
									this.voronoiHover = null
								}
								let newObjectId = -1
								if(intersects.length > i + 1 && intersects[i + 1].index) {
									const ix = intersects[i + 1].index
									newObjectId = this.props.map.tsneData[ix].d
								}
								const prevHoveredItem = this.props.map.hoveredItem
								const title = newObjectId > -1 ?  this.props.map.clusterNames[newObjectId] : ''
								//console.log(title, prevHoveredItem && prevHoveredItem.title)
								if(!prevHoveredItem || prevHoveredItem.title !== title) {

									this.props.dispatch(actions.hoveredOnMap({
										//title: newObjectId > -1 ? newObjectId + ' '+ this.props.map.clusterNames[newObjectId] + ' ' + objectId + ' ' + this.props.map.clusterNames[objectId]: '',//objectId + ' ' + this.props.map.clusterNames[objectId] ,//'cluster ' + intersectedObject.object.id,//
										title: newObjectId > -1 ?  this.props.map.clusterNames[newObjectId] +' '+newObjectId : '',
										mousex,
										mousey,
										cluster: true
									}))
								}
								
								//debugger;
								intersectedObject.object.material.opacity = 0.3
								this.voronoiHover = intersectedObject
								//this.drawVoronoiBoundry(objectId)
								this.intersected = intersectedObject
								//console.log('this.intersected', this.intersected)
							}


						}
						else {
							//this.intersected = intersectedObject
							//this.intersected.currentRGB = intersectedObject.object.material.emissive.getRGB()
							// const neighborId = intersectedObject.object.id
							// intersectedObject.object.material.emissive.setRGB(0, 0, 1)
							// this.props.dispatch(actions.hoveredOnMap({title: this.props.map.neighbors[neighborId],
							// 	//TODO is it doing anything?
							// 	//mousex: (this.mouse.x + 1)/2 * this.width,
							// 	//mousey: - (this.mouse.y - 1)/2 * this.height 
							// }))

						}
					}
				}
			} else {
				if ( this.intersected ) {
					//const materialColor = this.intersected.object.geometry.colors[this.intersected.index]

					//materialColor.setHex( this.intersected.currentHex );	
				}
				//console.log('setting this.intersected to null')
				this.intersected = null;

				if(this.props.map.hoveredItem) {
					this.debouncedNoHover()
				}
			}

		}

		
		this.renderer.render( this.scene, this.camera );

	}

	dictOps(dict1, dict2, fn) {
		const ret = {}
		Object.keys(dict1).forEach(key => {
			ret[key] = fn(dict1[key], dict2[key])
		})
		return ret
	}

	dictEqual(dict1, dict2, fn) {
		fn = !fn ? (d) => d : fn
		let ret = true
		Object.keys(dict1).forEach(key => {
			ret = ret && fn(dict1[key])===fn(dict2[key])
		})
		return ret
	}

	zoomClicked(e) {
		console.log('zoom clicked',this.props.map.zoom)
		if(this.props.map.zoom === 1) {
			this.props.dispatch(actions.zoomIn())
		}
		else {
			this.props.dispatch(actions.zoomOut())
		}
	}

	zoomInClicked() {
		this.props.dispatch(actions.zoomIn())
	}

	zoomOutClicked() {
		this.props.dispatch(actions.zoomOut())
	}



	mousedown(e) {
	    this.mouseDown = true;
	    this.sx = e.clientX;
	    this.sy = e.clientY;
	    this.ssx = e.clientX;
	    this.ssy = e.clientY;
		const w = this.props.wikipage.windowSize.width * pageToCanvasWidthRatio
		const h =  this.props.wikipage.windowSize.height * pageToCanvasHeightRatio

	    this.mouseStart.x = ( e.clientX / w ) * 2 - 1;
	    this.mouseStart.y = - ( e.clientY / h ) * 2 + 1;


	}

	mouseup(e) {
	    console.log('mouseup ', this.props.map.cameraMoving)
	    this.mouseDown = false;
    	if(this.props.map.cameraMoving) {
    		this.props.dispatch(actions.cameraMoving(false))
    	}

	}

	mouseout(e) 
	{
		//TODO why none of these are working?!?!
		this.props.dispatch(actions.hoveredOnMap(null))

		if(this.voronoiHover && this.voronoiHover.object.material) {
			this.voronoiHover.object.material.opacity = 0.02
			this.voronoiHover = null
		}

	}

	mousemove(e) {
		e.preventDefault();

	    const camera = this.camera
	          //scatterPlot = threejsObjects.scatterPlot

	    //disable drag since mouseup is not working
	    if (this.mouseDown) {
	    	// if(!this.props.map.cameraMoving) {
	    	// 	this.props.dispatch(actions.cameraMoving(true))
	    	// }
	     //    var dx = e.clientX - this.sx;
	     //    var dy = e.clientY - this.sy;

      //       camera.position.x -= dx;
      //       camera.position.y += dy;

	     //    //}     
	     //    this.sx += dx;
	     //    this.sy += dy;

	    }

		const w = this.props.wikipage.windowSize.width * pageToCanvasWidthRatio
		const h =  this.props.wikipage.windowSize.height * pageToCanvasHeightRatio

		this.mouse.x = ( e.nativeEvent.offsetX / w ) * 2 - 1;
		this.mouse.y = - ( e.nativeEvent.offsetY / h ) * 2 + 1;
		// const mouse2 = new THREE.Vector2()
		//  mouse2.x = ( e.nativeEvent.offsetX / this.width ) * 2 - 1;
		// mouse2.y = - ( e.nativeEvent.offsetY / this.height ) * 2 + 1;
		// console.log('react', mouse2)


	}


	mousewheel(e) {
		e.preventDefault()
		e.stopPropagation()
		/*
		if(!this.props.map.cameraMoving) {
	    	this.props.dispatch(actions.cameraMoving(true))
	    }
	

		let d = e.deltaY//((typeof e.wheelDelta != "undefined")?(-e.wheelDelta):e.detail);
	    d = 100 * ((d>0)?1:-1);    
	    const cPos = this.camera.position;
	    if (isNaN(cPos.x) || isNaN(cPos.y) || isNaN(cPos.y)) return;

		const mb = d>0 ? 0.05 : -0.05;
		const deltaZ = 2000
	    const newZ = cPos.z + mb * deltaZ
		
	    if (newZ <= ZOOM_MIN_Z || newZ >= ZOOM_MAX_Z ){
	       return ;
	    }
	    
	    const zoomLevel = 10 -  Math.round((newZ /  (ZOOM_MAX_Z - ZOOM_MIN_Z) * 10) * 10) / 10
	    
	    //console.log('debouncedSetZoom', debouncedSetZoom)
	    this.debouncedSetZoom(zoomLevel)
	    
	    cPos.z = newZ
	    */
	}

	mapLocationToDomLocation(location) {
			const width = this.props.wikipage.windowSize.width,
				  height =  this.props.wikipage.windowSize.height

		    const curLocationVector = new THREE.Vector3(this.x(location[0]),
		    											this.y(location[1]),
		    											 NODES_Z)

	        curLocationVector.project(this.camera)
	        return [(curLocationVector.x * width * pageToCanvasWidthRatio * 0.5 + width * pageToCanvasWidthRatio * 0.5), 
	        				-(curLocationVector.y * height * pageToCanvasHeightRatio * 0.5) + height * pageToCanvasHeightRatio * 0.5]
	}	

	render() {
		//console.log('map props', this.props)
		const mapReady = this.props.map.mapReady
		const hoveredItem = this.props.map.hoveredItem
		const cameraMoving = this.props.map.cameraMoving
		const zoomLevel = this.props.map.zoom
		const wikiHover = this.props.map.wikiHover

		// let curLocation = mapReady ? 
		// 				[this.x(this.props.map.location[0]), this.y(this.props.map.location[1])] : [0,0]
		let curLocation = [0, 0],
			wikiHoverLocation = [0, 0],
			curMousePos = [0, 0]
		if(mapReady) {

	        curLocation = this.mapLocationToDomLocation(this.props.map.location)

			const w = this.props.wikipage.windowSize.width * pageToCanvasWidthRatio
			const h =  this.props.wikipage.windowSize.height * pageToCanvasHeightRatio

			curMousePos = [ (this.mouse.x + 1)/2 * w ,
							 -(this.mouse.y - 1)/2 * h]


		}
		if(wikiHover) {
			wikiHoverLocation = this.mapLocationToDomLocation(wikiHover.location)
		}

		const pageTitle = this.props.map.pageTitle
		if(this.updateNeighbors) {
			//this.addNeighbors(this.props.map.location, this.props.map.neighbors, this.props.wikipage.pageTitle)
			this.updateNeighbors = false
		}

		const dotSize = zoomLevel > 7 ? '8px' : '4px'


		
		return (
				<div className="root">							
					<div className="loading" style={{opacity: mapReady ? 0 : 1}}>loading<span>....</span></div>
					<div className="mapContainer" style={{opacity: this.props.map.mapReady ? 1 : 0 }}>
						<div className="controls">
							{/*
							<button className={`zoomBtn ${zoomLevel===11 ? 'disabled' : ''}`} 
									onClick={(e) => this.zoomInClicked()}>zoom to article</button>
							<button className={`zoomBtn ${zoomLevel===1 ? 'disabled' : ''}`}  
									onClick={(e) => this.zoomOutClicked()}>zoom out</button>
							*/}
							<button className="zoomBtn"  
									onClick={(e) => this.zoomClicked()}>
									zoom {zoomLevel===1 ? 'to article' : 'out'}
							</button>
							<SearchBar results={this.props.wikipage.wikiSearchResults} dispatch={this.props.dispatch} />

						</div>
						
						<div ref="threejs" className="threeContainer"
							onMouseDown={(e) => this.mousedown(e)}
							onMouseUp={(e) => this.mouseup(e)}
							onMouseMove={(e) => this.mousemove(e)}
							onMouseOut={(e) => this.mouseout(e)}
							onWheel={(e) => this.mousewheel(e)}
							onClick ={(e) => this.mouseClicked(e)}
						></div>

						<ArrowLabel location={curLocation}
									fontSize={zoomLevel > 7 ? '14' : '12'}
									opacity={cameraMoving || (curLocation[0]<1 && curLocation[1] < 1) ? 0 : 1}
									arrow={(wikiHoverLocation[0] && wikiHoverLocation[1]) ? false : true}
									direction={zoomLevel > 7 ? 1 : 0}
									arrowLenght={zoomLevel > 7 ? 20 : 25}
									label={zoomLevel < 3 && !wikiHover ? 'You are here!' : pageTitle}/>

						<ArrowLabel location={hoveredItem ? [hoveredItem.mousex, hoveredItem.mousey] : null}
									color={hoveredItem && hoveredItem.cluster ? '#0000FF' : '#000000'}
									//arrow={hoveredItem && hoveredItem.cluster && hoveredItem.title ? true : false}
									arrow={false}
									opacity={hoveredItem && !cameraMoving ? 1 : 0}
									arrowLenght={zoomLevel > 7 ? 10 : 15}
									direction={1}
									label={hoveredItem && hoveredItem.title!==pageTitle ? hoveredItem.title : ''}/>

						
						<ArrowLabel location={wikiHoverLocation}
									fontSize={zoomLevel > 7 ? '14' : '12'}
									opacity={cameraMoving || (wikiHoverLocation[0]<1 && wikiHoverLocation[1] < 1) ? 0 : 1}
									label={wikiHover ? wikiHover.title : ''}/>


						
					</div>
				</div>
				
			)
	}

}