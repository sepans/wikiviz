import React, { Component } from 'react'
import { scaleLinear, scaleOrdinal, schemeCategory20c } from 'd3-scale'
import { extent } from 'd3-array'
import { rgb, hsl } from 'd3-color'
import { voronoi } from 'd3-voronoi'
import * as actions from '../actions/'
import { debounce } from 'lodash'





//import THREE from 'three'
import THREE from 'three'
import OrbitControls  from 'three-orbitcontrols'
// import TextSprite from '../utils/ThreeTextSprite'
import { SpriteText2D, MeshText2D, textAlign } from 'three-text2d'
import TWEEN from 'tween.js'

//const OrbitControls = require('three-orbit-controls')(THREE)
const ANIMATION_DURATION = 20 //ms?!
const r = 8
const HIGHLIGHT_Z = -1530
const NODES_Z = -1530
const CAMERA_Z = 6500
const MAX_NODES_DISPLAY = /*tsneData.length*/ 50000
const ZOOM_MIN_Z = -1200,
      ZOOM_MAX_Z = 8100


const getX = d => d.x
const getY = d => d.y

export default class Map extends Component {


	componentDidMount() {
		//this.init()
	}

	init(tsneData) {
		//const OrbitControls = OrbitControlsModule(THREE)
		console.log('INITINITINIT')

		this.youarehere = []
		this.sprites = []

		let container
		let camera, controls, scene, renderer;
		//let pickingData = [], pickingTexture, pickingScene;
		const objects = [];
		let highlightBox;
		this.mouse = new THREE.Vector2()
		this.mouseStart = new THREE.Vector2()
		const offset = new THREE.Vector3( 10, 10, 10 )

		const width = window.innerWidth * 0.48//Math.min(window.innerWidth * 0.45, window.innerHeight)
		const height = window.innerHeight * 0.95// width

		//TODO move to redux store
		this.width = width
		this.height = height

		container = this.refs.threejs
		const SCALE_UNIVERSE_FACTOR = 4

		this.x = scaleLinear().range([- SCALE_UNIVERSE_FACTOR * width, SCALE_UNIVERSE_FACTOR * width])
		this.y= scaleLinear().range([-SCALE_UNIVERSE_FACTOR * height, SCALE_UNIVERSE_FACTOR * height])
		
		this.x.domain(extent(tsneData, getX))
		this.y.domain(extent(tsneData, getY))

		console.log('domains', this.x.domain(), this.y.domain())

		this.colorScale = scaleOrdinal()
			.range(["rgb(33,240,182)", "rgb(28,135,92)", "rgb(148,211,188)", "rgb(21,114,156)",
			 "rgb(131,172,243)", "rgb(135,17,172)", "rgb(142,128,251)", "rgb(105,48,110)", 
			 "rgb(248,134,191)", "rgb(25,69,197)", "rgb(253,63,190)", "rgb(63,22,249)", "rgb(177,230,50)",
			 "rgb(58,166,9)", "rgb(83,242,89)", "rgb(110,57,13)", "rgb(221,192,189)", "rgb(237,75,4)",
			 "rgb(142,16,35)", "rgb(222,138,44)", "rgb(71,74,9)", "rgb(234,214,36)", "rgb(124,136,105)",
			 "rgb(254,29,102)", "rgb(168,119,124)"])
	
		this.colorScale.domain([0, 480])

		camera = new THREE.PerspectiveCamera( 45, width / height, 1, 10000 );
		camera.position.set(0 , 0, CAMERA_Z);
		//camera.lookAt(new THREE.Vector3(width/2, height/2, -800));
		console.log('camera before', camera)


		scene = new THREE.Scene();
		let light = new THREE.DirectionalLight( 0xffffff, 1 );
		light.position.set( 1, 1, 1 ).normalize();
		scene.add( light );

		light = new THREE.AmbientLight( 0x666666 );
		scene.add( light );

		const geometry = new THREE.BoxBufferGeometry( 4, 4, 4 );
		//points
		const PARTICLE_SIZE = 15
		const pointsGeometry = new THREE.Geometry()
		const pointsContainer = new THREE.Object3D()

		for ( var i = 0; i < tsneData.length; i ++ ) {
			const color = this.colorScale(tsneData[i].dbscanc)
			
			// const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: color, opacity: 0.8, transparent: true  } ) );
			// object.position.x = this.x(tsneData[i].x)//Math.random() * 10000 - 5000;
			// object.position.y = this.y(tsneData[i].y)//Math.random() * 6000 - 3000;
			// object.position.z = NODES_Z//Math.random() * -9000 ;
			// object.rotation.x = 0//Math.random() * 2 * Math.PI;
			// object.rotation.y = 0//Math.random() * 2 * Math.PI;
			// object.rotation.z = 0//Math.random() * 2 * Math.PI;
			// object.scale.x = .3//Math.random() * 200 + 100;
			// object.scale.y = .3//Math.random() * 200 + 100;
			// object.scale.z = Math.random() ;

			var vertex = new THREE.Vector3();
			vertex.x = this.x(getX(tsneData[i]))
			vertex.y = this.y(getY(tsneData[i]))
			vertex.z = NODES_Z
			//console.log(vertex)
			pointsGeometry.vertices.push(vertex)
			const rgbColor = rgb(color)//hsl(tsneData[i].dbscanc/500 * 256, 0.7, 0.7).rgb()
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
		console.log(points, pointsGeometry)

		pointsContainer.add(points)
		scene.add(pointsContainer)

		console.log('MAP props', this.props)
	
		this.raycaster = new THREE.Raycaster();
		console.log('raycaster threshold ', this.raycaster.params.Points.threshold, this.raycaster.params)
		this.raycaster.params.Points.threshold = 10
		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor( 0xffffff );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( width, height );
		renderer.sortObjects = false;





		container.appendChild( renderer.domElement );

		 //renderer.domElement.addEventListener( 'mousemove', (e) => this.mouseMove(e) )
		// renderer.domElement.addEventListener( 'click', (e) => this.mouseClicked(e) )

// window.addEventListener( 'mousewheel', this.mousewheel.bind(this), false );
// window.addEventListener( 'DOMMouseScroll', this.mousewheel.bind(this), false ); // firefox


		//controls = new OrbitControls(camera, renderer.domElement)
		console.log('camera after', camera)

		//camera.lookAt(new THREE.Vector3(width/2, height/2, -800));
		//controls.target.set(width/2, height/2, -600);
		//debugger;
		//controls.update();
		//console.log(controls)
		//controls.enableZoom = false
		//renderer.render( scene, camera )


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

		this.animate()
	}

	mouseClicked(e) {
		console.log(this.intersected)
		if(this.intersected) {
			const id = this.intersected.index

			const tsneIndex = id //- this.articleStartingId
			const numberofDots = this.props.map.tsneData.length
			const title = (tsneIndex < numberofDots || true) ? //TODO fix for neighbors
							 this.props.map.tsneData[tsneIndex].title :
							 this.props.map.neighbors[tsneIndex - numberofDots ]
			console.log('title', title)

			this.props.dispatch(actions.checkRedirectAndFetch(title))

		}
	}


	addNeighbors(location, neighbors, pageTitle) {
		console.log('ADD/UPDATE NEIG...', location, pageTitle, this.youarehere)
		const numberOfNeighbors = 8
		if(!this.youarehere ) {
			return
		}
		//this.neighborsContainer = new THREE.Object3D()
		if(this.youarehere.length===0) {
			for ( var i = 0; i < numberOfNeighbors + 1; i ++ ) {
				const fill = i===0 ? '#000000' : '#888888'
				const object = new THREE.Mesh( this.geometry, new THREE.MeshLambertMaterial( { color: fill, opacity: 0.8, transparent: true  } ) );
				
				const title = i===0 ? pageTitle : ''//neighbors[i]
				const align = i===0 ? textAlign.center : 
						Math.cos(i * 2 * Math.PI / numberOfNeighbors) > 0 ? textAlign.left : textAlign.right
				const marginLeft =  i===0 ? 0 : 
						Math.cos(i * 2 * Math.PI / numberOfNeighbors) > 0 ? 5 : 5//-5
				const font = i===0 ? '16px Arial' : '8px Arial'
				const sprite = new SpriteText2D(title, { 
					align: align,  font: font, fillStyle: fill , antialias: false ,
				    //shadowColor: 'rgba(0, 0, 0, 0.2)',
				    // shadowBlur: 3,
				    // shadowOffsetX: 2,
				    // shadowOffsetY: 2
				})
				const x = i===0 ? this.x(location[0]) : this.x(location[0]) + r * Math.cos(i * 2 * Math.PI / numberOfNeighbors)
				const y = i===0 ? this.y(location[1]) : this.y(location[1]) + r * Math.sin(i * 2 * Math.PI / numberOfNeighbors)
				const z = HIGHLIGHT_Z

				sprite.position.set(x + marginLeft, y + 5, z + 5)
				sprite.material.alphaTest = 0.1
				//sprite.scale.set(1.5, 1.5, 1.5)
				//console.log('FILL', sprite.fillStyle)
				if(i===0) {
					this.sprites.push(sprite)
					this.scene.add(sprite)
				}

				
				//const node = tsneData[i]
				object.position.x = x//Math.random() * 10000 - 5000;
				object.position.y = y//Math.random() * 6000 - 3000;
				object.position.z = z//Math.random() * -9000 ;
				object.rotation.x = 0//Math.random() * 2 * Math.PI;
				object.rotation.y = 0//Math.random() * 2 * Math.PI;
				object.rotation.z = 0//Math.random() * 2 * Math.PI;
				object.scale.x = .8//Math.random() * 200 + 100;
				object.scale.y = .8//Math.random() * 200 + 100;
				object.scale.z = .8//Math.random() * 200 + 100;
				//console.log(object.position.z)
				this.scene.add( object );
				this.youarehere.push(object)
			}				
		}
		else {
			//this.sprite.position.set(this.x(location[0]), this.y(location[1]), HIGHLIGHT_Z)
			this.youarehere.forEach((you, i) => {
				const x = i===0 ? this.x(location[0]) : this.x(location[0]) + r * Math.cos(i * 2 * Math.PI / numberOfNeighbors)
				const y = i===0 ? this.y(location[1]) : this.y(location[1]) + r * Math.sin(i * 2 * Math.PI / numberOfNeighbors)

				//console.log('you', i, r, x, y)


				// you.position.x = this.x(x)
				// you.position.y = this.y(y)
				you.position.set(x, y, HIGHLIGHT_Z)

			})
			this.sprites.forEach((sprite, i) => {
				const x = i===0 ? this.x(location[0]) : this.x(location[0]) + r * Math.cos(i * 2 * Math.PI / numberOfNeighbors)
				const y = i===0 ? this.y(location[1]) : this.y(location[1]) + r * Math.sin(i * 2 * Math.PI / numberOfNeighbors)
				const title = i===0 ? pageTitle : neighbors[i]

				console.log('sprite', i, r, x, y)

				sprite.text= title
				// sprite.position.x = this.x(x)
				// sprite.position.y = this.y(y)
				sprite.position.set(x, y, HIGHLIGHT_Z + 5)

			})
			// 			this.sprite.position.set(this.x(location[0]), this.y(location[1]), HIGHLIGHT_Z)
			// this.youarehere.forEach((you) {
			// 	this.youarehere.position.x = this.x(location[0])
			// 	this.youarehere.position.y = this.y(location[1])


		}
		
	}

	drawVoronoi() {
		const centroids = this.props.map.centroidsData
		const rangeX = this.x.range()
		const rangeY = this.y.range()
		const extent = [[rangeX[0], rangeY[0]], [rangeX[1], rangeY[1] ]]
		const voro = voronoi()
			.x(d => this.x(d[0]))
			.y(d => this.y(d[1]))
			//.extent(extent)

		const polygons = voro.polygons(centroids)//.slice(0,10)
		//console.log('polygons', polygons)

		polygons.forEach((polygon, indx) => {
			console.log('polygon', polygon)
			polygon = polygon.filter(d => d)
			
			let points = []
			for(let i=0 ; i< polygon.length -1 ; i++) {
			 	//const distance = this.calculateDistance([history[i].x, history[i].y], [history[i + 1].x, history[i + 1].y])
			 	const curve = new THREE.CubicBezierCurve3(
					new THREE.Vector3( polygon[i][0], polygon[i][1], NODES_Z ),
					new THREE.Vector3( polygon[i][0], polygon[i][1], NODES_Z ),
					// new THREE.Vector3( this.x((polygon[i].x + polygon[i + 1].x) * 0.5), this.y((polygon[i].y + polygon[i + 1].y) * 0.5) , NODES_Z ),
					// new THREE.Vector3( this.x((polygon[i].x + polygon[i + 1].x) * 0.5), this.y((polygon[i].y + polygon[i + 1].y) * 0.5) ,  NODES_Z),
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

			    // Create the final Object3d to add to the scene
			 //if(!voronoiObject) {
				 const voronoiObject = new THREE.Line(historyLineGeometry, lineMaterial);
				 this.scene.add(voronoiObject);

			 // }
			 // else {
			 // 	voronoiObject.geometry = historyLineGeometry
			 // }
			 
			
			 /*
				const voroGeo  = new THREE.Geometry()
				for(let i=0 ; i< polygon.length -1 ; i++) {
					 voroGeo.vertices.push( new THREE.Vector3(polygon[i][0], polygon[i][1], NODES_Z));
				}

				var normal = new THREE.Vector3( 0, 1, 0 ); //optional
				var color = new THREE.Color( 0xffaa00 ); //optional
				var materialIndex = 0; //optional
				var face = new THREE.Face3( 0, 1, 2, normal, color, materialIndex );
				voroGeo.faces.push( face );
				// for ( let i = 0; i< polygon.length-2; i++) {
				//         voroGeo.faces.push( new THREE.Face3(0,i+1,i+2));
				        
				// }
				voroGeo.computeFaceNormals();
voroGeo.computeCentroids();
//geometry.computeFaceNormals();    
    			//const mesh= new THREE.Mesh( voroGeo, new THREE.MeshNormalMaterial() );				
				  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.FrontSide } );
  		  		const mesh = new THREE.Mesh( voroGeo, material );
  				this.scene.add( mesh );
*/

				const voroShape = new THREE.Shape();
				for(let i=0 ; i< polygon.length ; i++) {
					const x = polygon[i][0]
					const y = polygon[i][1]
					if (i == 0) {
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
				console.log(voroGeo)
				const material = new THREE.MeshBasicMaterial( {shading: THREE.FlatShading,  color: this.colorScale(indx + 1),transparent: true, opacity: 0.02, side: THREE.FrontSide } );
				//debugger;
  		  		const mesh = new THREE.Mesh( voroGeo, material );
  				this.scene.add( mesh );


			})


		//var points = curve.getSpacedPoints( 20 );

	}

	componentDidUpdate(prevProps) {
		if((prevProps.map.centroidsData==null && this.props.map.centroidsData!=null && this.props.map.tsneData) ||
		   (prevProps.map.tsneData==null && this.props.map.tsneData!=null && this.props.map.centroidsData)) {
			//this.addBoxes(nextProps.tsneData)
			//this.drawVoronoi()
			//this.renderer.render( this.scene, this.camera );

		}

	}

	componentWillReceiveProps(nextProps) {
		const location = nextProps.map.location
		const prevLocation = this.props.map.location
		const CAMERA_Y_OFFSET = 50
		if(this.props.map.tsneData==null && nextProps.map.tsneData!=null) {
			//this.addBoxes(nextProps.tsneData)
			this.init(nextProps.map.tsneData)
			//this.renderer.render( this.scene, this.camera );

		}
		if(this.locationChanged(this.props.map.location, nextProps.map.location)) {
			console.log('UPDATING neighbors')
			//this.addNeighbors(nextProps.map.location, nextProps.map.neighbors, nextProps.wikipage.pageTitle)
			this.updateNeighbors = true;
			this.drawHistory()
		}
		if(this.props.map.zoom != nextProps.map.zoom && (nextProps.map.zoom===11 || nextProps.map.zoom===1)) {

			const nextCameraProps = nextProps.map.zoom===11 ? 
			{
				x: this.x(location[0]),
				y: this.y(location[1]) - CAMERA_Y_OFFSET,
				z: HIGHLIGHT_Z + 600,
				fov: 60,
				_x: 0.25,
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
			this.tweenCamera(nextCameraProps, {}, () => {

			})

		}
		else if(this.props.map.zoom===11 && this.locationChanged(this.props.map.location, nextProps.map.location)) {
			const distance = this.calculateDistance(prevLocation, location)
			const MAX_DISTANCE = this.x.domain()[1] - this.x.domain()[0]
			const vFOV = this.camera.fov * Math.PI / 180
			const zOffset = Math.tan( vFOV / 2) * distance
			const cameraZ = zOffset < (this.camera.position.z - NODES_Z) ? this.camera.z : (this.camera.position.z + zOffset) 

			const midpoint = {x: this.x((location[0] + prevLocation[0])/2), y: this.y((location[1] + prevLocation[1])/2) - CAMERA_Y_OFFSET, z: cameraZ, fov: 50}
			const time = 500 + 2 * (distance * 2000) / MAX_DISTANCE
			
			this.tweenCamera(midpoint, {tween: TWEEN.Easing.Exponential.Out, time: time/2}, () => {
				
				const nextCameraProps = 
					{
						x: this.x(location[0]),
						y: this.y(location[1]) - CAMERA_Y_OFFSET,
						z: HIGHLIGHT_Z + 600,
						fov: 60,
						_x: 0.25,
						_y: 0.0,
						_z: 0.0
					} 
				this.tweenCamera(nextCameraProps, {tween: TWEEN.Easing.Exponential.In, time: time/2})
				
			})
	
			
		}
	}

	tweenCamera(to, options, done) {
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
			
			var that = this
 			var tween = new TWEEN.Tween(from)
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
	        .onComplete(function () {
	        	console.log('zoom out completed')
	        	if(done) {
	        		done()
	        	}
	            //that.camera.lookAt(new THREE.Vector3(0, 0, 0));
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
	
	makeTextSprite( message, parameters )
    {
        if ( parameters === undefined ) parameters = {};
        var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
        var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
        var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
        var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
        var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;
        var metrics = context.measureText( message );
        var textWidth = metrics.width;

        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        //roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);

        context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
        context.fillText( message, borderThickness, fontsize + borderThickness);

        var texture = new THREE.Texture(this.renderer.domElement) 
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
        return sprite;  
    }	

	renderThree() {
	 	//console.log('.')
		//this.controls.update(  );
		
		TWEEN.update()
		
		if(this.props.map.raycast) {
			this.raycaster.setFromCamera( this.mouse, this.camera );
			var intersects = this.raycaster.intersectObjects( this.scene.children, true );
			if ( intersects.length > 0) {
				let i = 0
				let intersectedObject = intersects[i]
				while(i < intersects.length && intersectedObject.object.type==='Sprite') {
					i++
					intersectedObject = intersects[i]
				}
				//console.log(intersects[0])

				// const intersectId = intersects[0].object.material.emissive ? 0 : 1
				// if (intersects[intersectId] && this.intersected != intersects[intersectId].object && intersects[intersectId].object.material.emissive) {
				// 	if ( this.intersected ) {
				// 		this.intersected.material.emissive.setHex( this.intersected.currentHex );	
				// 	} 
				// 	this.intersected = intersects[intersectId].object;
				// 	this.intersected.currentHex = this.intersected.material.emissive.getHex();
				// 	this.intersected.material.emissive.setHex( 0xff0000 );
				// 	const tsneIndex = intersects[intersectId].object.id - this.articleStartingId
				// 	const hoveredItem = tsneIndex < MAX_NODES_DISPLAY ?
				// 			 this.props.map.tsneData[tsneIndex] :
				// 			 {title: this.props.map.neighbors[tsneIndex - MAX_NODES_DISPLAY ]}
				// 	this.props.dispatch(actions.hoveredOnMap(hoveredItem))
				// }
				if(intersectedObject && this.props.map.tsneData) {
					//console.log(intersects)
					if(intersectedObject.index) {
						const tsneIndex = intersectedObject.index
						const hoveredItem = this.props.map.tsneData[tsneIndex] 
						const materialColor = intersectedObject.object.geometry.colors[tsneIndex]
						//console.log(materialColor)
						
						this.intersected = intersectedObject
						// if(!this.intersected.currentHex) {
						// 	this.intersected.currentHex = materialColor.getHex()

						// }
						if(materialColor) {
							//materialColor.setRGB(0, 0, 1)
							intersectedObject.object.geometry.colorsNeedUpdate = true
							//console.log(tsneIndex, hoveredItem.title, )
							hoveredItem.mousex = (this.mouse.x + 1)/2 * this.width + 8
							hoveredItem.mousey = - (this.mouse.y - 1)/2 * this.height - 5
							this.props.dispatch(actions.hoveredOnMap(hoveredItem))
						}
						else {
							//console.log('no material color ', intersectedObject.index, intersectedObject)
						}


					}
					else if(intersectedObject.object.id) {
						const neighborId = intersectedObject.object.id
						if(!intersectedObject.object.material.emissive) {
							console.log('neighbor ', intersectedObject)

						}
						else {
							//this.intersected = intersectedObject
							//this.intersected.currentRGB = intersectedObject.object.material.emissive.getRGB()
							intersectedObject.object.material.emissive.setRGB(0, 0, 1)
							this.props.dispatch(actions.hoveredOnMap({title: this.props.map.neighbors[neighborId],
								//TODO is it doing anything?
								//mousex: (this.mouse.x + 1)/2 * this.width,
								//mousey: - (this.mouse.y - 1)/2 * this.height 
							}))

						}
					}
				}
			} else {
				if ( this.intersected ) {
					//const materialColor = this.intersected.object.geometry.colors[this.intersected.index]

					//materialColor.setHex( this.intersected.currentHex );	
				}
				this.intersected = null;
				if(this.props.map.hoveredItem) {
					this.props.dispatch(actions.hoveredOnMap(null))
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
		if(this.props.map.zoom === 11) {
			this.props.dispatch(actions.zoomOut())
		}
		else {
			this.props.dispatch(actions.zoomIn())
		}
	}

	drawHistory() {
		 const history = this.props.map.wikiHistory
		 if(history.length < 2) {
		 	return
		 }
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

		//var points = curve.getSpacedPoints( 20 );

		var path = new THREE.Path();
		var historyLineGeometry = path.createGeometry( points );
		  
		historyLineGeometry.dynamic = true
		var material = new THREE.LineBasicMaterial({
	        color: 0x1BB4E1
	    });

		    // Create the final Object3d to add to the scene
		 if(!this.splineObject) {
			 this.splineObject = new THREE.Line(historyLineGeometry, material);
			 this.scene.add(this.splineObject);

		 }
		 else {
		 	this.splineObject.geometry = historyLineGeometry
		 }

	}

	mousedown(e) {
	    this.mouseDown = true;
	    this.sx = e.clientX;
	    this.sy = e.clientY;
	    this.ssx = e.clientX;
	    this.ssy = e.clientY;
	    const w = this.width
	    const h = this.height

	    this.mouseStart.x = ( e.clientX / w ) * 2 - 1;
	    this.mouseStart.y = - ( e.clientY / h ) * 2 + 1;


	}

	mouseup(e) {
	    this.mouseDown = false;
	}


	mousemove(e) {
		e.preventDefault();

	    const camera = this.camera
	          //scatterPlot = threejsObjects.scatterPlot

	    if (this.mouseDown) {
	        var dx = e.clientX - this.sx;
	        var dy = e.clientY - this.sy;

            camera.position.x -= dx;
            camera.position.y += dy;

	        //}     
	        this.sx += dx;
	        this.sy += dy;

	    }

	    const w = this.width
	    const h = this.height

		this.mouse.x = ( e.nativeEvent.offsetX / this.width ) * 2 - 1;
		this.mouse.y = - ( e.nativeEvent.offsetY / this.height ) * 2 + 1;
		// const mouse2 = new THREE.Vector2()
		//  mouse2.x = ( e.nativeEvent.offsetX / this.width ) * 2 - 1;
		// mouse2.y = - ( e.nativeEvent.offsetY / this.height ) * 2 + 1;
		// console.log('react', mouse2)


	}


	mousewheel(e) {
		e.preventDefault()
		e.stopPropagation()

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
	    
	    //debounce(actions.setZoom(zoomLevel))
	    if(!this.debouncedSetZoom) {
		    this.debouncedSetZoom = debounce((level) => this.props.dispatch(actions.setZoom(level)), 500)

	    }
	    //console.log('debouncedSetZoom', debouncedSetZoom)
	    this.debouncedSetZoom(zoomLevel)
	    
	    cPos.z = newZ
	}	

	render() {
		//console.log('map props', this.props)
		const hoveredItem = this.props.map.hoveredItem
		const hasHistory = this.props.map.wikiHistory.length > 1
		const zoomBtnText = this.props.map.zoom===11 ? 'show all map' : 'zoom to article' 
		if(this.updateNeighbors) {
			this.addNeighbors(this.props.map.location, this.props.map.neighbors, this.props.wikipage.pageTitle)
			this.updateNeighbors = false
		}
		const buttonStyles = {
			position: 'absolute',
    		backgroundColor: '#FFF',
    		border: '1px solid #0000FF',
    		color: '#0000FF',
    		margin: '5px',
		}
		const calloutStyles = {
			position: 'absolute',
			bottom: '10px',
			pointerEvents: 'none',
			top: hoveredItem ? hoveredItem.mousey : 0, left: hoveredItem ? hoveredItem.mousex: 0,
    		textShadow: '0px 0px 2px rgba(255, 255, 255, 1)',
		}
		return (
				<div style={{position: 'relative'}}>
					<button style={buttonStyles} onClick={(e) => this.zoomClicked()}>{zoomBtnText}</button>
					{/*<button onClick={(e) => this.drawHistory()} disabled={!hasHistory}>draw history</button>*/}
					<div style={{margin: '0px'}} ref="threejs"
						onMouseDown={(e) => this.mousedown(e)}
						onMouseUp={(e) => this.mouseup(e)}
						onMouseMove={(e) => this.mousemove(e)}
						onWheel={(e) => this.mousewheel(e)}
						onClick ={(e) => this.mouseClicked(e)}
					></div>
					<div style={calloutStyles}>{hoveredItem ? hoveredItem.title : ''}</div>
				</div>
				
			)
	}

}