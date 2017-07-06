import React, { Component } from 'react'
import { scaleLinear, scaleOrdinal, schemeCategory20c } from 'd3-scale'
import { extent } from 'd3-array'
import { rgb } from 'd3-color'
import * as actions from '../actions/'





//import THREE from 'three'
import THREE from 'three'
import OrbitControls  from 'three-orbitcontrols'
// import TextSprite from '../utils/ThreeTextSprite'
import { SpriteText2D, MeshText2D, textAlign } from 'three-text2d'

//const OrbitControls = require('three-orbit-controls')(THREE)
const ANIMATION_DURATION = 20 //ms?!
const r = 10
const HIGHLIGHT_Z = -1460
const NODES_Z = -1530
const CAMERA_Z = 500
const MAX_NODES_DISPLAY = /*tsneData.length*/ 50000


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
		this.mouse = new THREE.Vector2();
		const offset = new THREE.Vector3( 10, 10, 10 );

		const width = window.innerWidth * 0.48//Math.min(window.innerWidth * 0.45, window.innerHeight)
		const height = window.innerHeight * 0.95// width

		//TODO move to redux store
		this.width = width
		this.height = height

		container = this.refs.threejs

		this.x = scaleLinear().range([-width, width])
		this.y= scaleLinear().range([-height, height])
		
		this.x.domain(extent(tsneData, d => d.rx))
		this.y.domain(extent(tsneData, d => d.ry))

		console.log('domains', this.x.domain(), this.y.domain())

		this.colorScale = scaleOrdinal(schemeCategory20c)
	


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
		const PARTICLE_SIZE = 3
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
			vertex.x = this.x(tsneData[i].rx)
			vertex.y = this.y(tsneData[i].ry)
			vertex.z = NODES_Z
			//console.log(vertex)
			pointsGeometry.vertices.push(vertex)
			const rgbColor = rgb(color)
			const nodeColor = new THREE.Color().setRGB(rgbColor.r/ 255, rgbColor.g/255, rgbColor.b/255)
			if(i===0)
			console.log(rgb, rgb(color))
			pointsGeometry.colors.push(nodeColor)
			// if(i===0) {
			// 	this.articleStartingId = object.id
			// }
			//scene.add( object );
		}

		const material = new THREE.PointsMaterial( { 
			size: PARTICLE_SIZE, 
			/*map: sprite,*/ 
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
		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor( 0xffffff );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( width, height );
		renderer.sortObjects = false;





		container.appendChild( renderer.domElement );

		renderer.domElement.addEventListener( 'mousemove', (e) => this.mouseMove(e) )
		renderer.domElement.addEventListener( 'click', (e) => this.mouseClicked(e) )

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
			const id = this.intersected.id

			const tsneIndex = id - this.articleStartingId
			const title = tsneIndex < MAX_NODES_DISPLAY ?
							 this.props.map.tsneData[tsneIndex].title :
							 this.props.map.neighbors[tsneIndex - MAX_NODES_DISPLAY ]

			this.props.dispatch(actions.checkRedirectAndFetch(title))

		}
	}

	mouseMove(e) {
		//console.log('.')
		e.preventDefault();
		this.mouse.x = ( e.offsetX / this.width ) * 2 - 1;
		this.mouse.y = - ( e.offsetY / this.height ) * 2 + 1;
		//console.log(this.mouse)

	}

	addNeighbors(location, neighbors, pageTitle) {
		console.log('ADD/UPDATE NEIG...', location, pageTitle, this.youarehere)
		const numberOfNeighbors = 20
		if(!this.youarehere ) {
			return
		}
		//this.neighborsContainer = new THREE.Object3D()
		if(this.youarehere.length===0) {
			for ( var i = 0; i < numberOfNeighbors + 1; i ++ ) {
				const fill = i===0 ? '#000000' : '#888888'
				const object = new THREE.Mesh( this.geometry, new THREE.MeshLambertMaterial( { color: fill, opacity: 0.6, transparent: true  } ) );
				
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
				console.log('init', i, r, x, y)

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
				 object.scale.x = .4//Math.random() * 200 + 100;
				 object.scale.y = .4//Math.random() * 200 + 100;
				 object.scale.z = .4//Math.random() * 200 + 100;
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

				console.log('you', i, r, x, y)


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

	componentWillReceiveProps(nextProps) {
		console.log('recieved props', this.props, nextProps, nextProps.location!=this.props.location)
		if(this.props.map.tsneData==null && nextProps.map.tsneData!=null) {
			//this.addBoxes(nextProps.tsneData)
			this.init(nextProps.map.tsneData)
			//this.renderer.render( this.scene, this.camera );

		}
		if(this.locationChanged(this.props.map.location, nextProps.map.location)) {
			console.log('UPDATING neighbors')
			//this.addNeighbors(nextProps.map.location, nextProps.map.neighbors, nextProps.wikipage.pageTitle)
			this.updateNeighbors = true;
		}
		if((this.props.map.zoom != nextProps.map.zoom) || 
			(this.props.map.zoom===11 && this.locationChanged(this.props.map.location, nextProps.map.location))) {
			this.time = 0 //reset time
			const location = nextProps.map.location
			this.nextCameraPosition = nextProps.map.zoom===11 ?
						 {x: this.x(location[0]), y: this.y(location[1]) - 80, z: HIGHLIGHT_Z + 100} : {x:  0, y: 0, z: CAMERA_Z}
			this.nextCameraRotation = nextProps.map.zoom===11  ? {_x: 0.65, _y: 0.0, _z: 0.0} : {_x: 0.0, _y: 0.0, _z: 0.0} 
			const nextCameraFov = nextProps.map.zoom===11  ? 60 : 45
			this.cameraFovStep = (nextCameraFov - this.camera.fov)/ANIMATION_DURATION
			this.positionStep = this.dictOps(this.nextCameraPosition, this. camera.position, (a, b) => (a - b)/ANIMATION_DURATION)
			this.rotationStep = this.dictOps(this.nextCameraRotation, this. camera.rotation, (a, b) => (a - b)/ANIMATION_DURATION)

			

		}
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
		this.time++;
		//this.camera.lookAt( this.scene.position )
		if(this.nextCameraPosition && !this.dictEqual(this.camera.position, this.nextCameraPosition, d => Math.round(d))) { 
			const newPosition = this.dictOps(this.camera.position, this.positionStep, (a, b) => a + b)
			const newRotation = this.dictOps(this.camera.rotation, this.rotationStep, (a, b) => a + b)
			//const cameraLookAt = this.dictOps(this.nextCameraPosition, {x: 0, y: 0, z:0}, (a, b) => a + 300 * Math.cos( 0.2 * this.time ))
			//console.log(cameraLookAt, this.nextCameraPosition)
			//this.camera.lookAt(cameraLookAt)
			this.camera.position.set(newPosition.x, newPosition.y, newPosition.z)
			this.camera.rotation.set(newRotation._x, newRotation._y, newRotation._z)
			this.camera.fov = this.camera.fov + this.cameraFovStep;
			this.camera.updateProjectionMatrix();
		}
		
		if(this.props.map.raycast) {
			this.raycaster.setFromCamera( this.mouse, this.camera );
			var intersects = this.raycaster.intersectObjects( this.scene.children, true );
			if ( intersects.length > 0 ) {
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
						materialColor.setRGB(0, 0, 1)
						intersectedObject.object.geometry.colorsNeedUpdate = true
						//console.log(tsneIndex, hoveredItem.title, )
						this.props.dispatch(actions.hoveredOnMap(hoveredItem))

					}
					else if(intersectedObject.object.id) {
						const neighborId = intersectedObject.object.id
						//console.log('neighbor ', neighborId, intersectedObject)
						intersectedObject.object.material.emissive.setRGB(0, 0, 1)
						this.props.dispatch(actions.hoveredOnMap({title: this.props.map.neighbors[neighborId]}))
					}
				}
			} else {
				if ( this.intersected ) {
					this.intersected.material.emissive.setHex( this.intersected.currentHex );	
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


	render() {
		console.log('map props', this.props)
		if(this.updateNeighbors) {
			this.addNeighbors(this.props.map.location, this.props.map.neighbors, this.props.wikipage.pageTitle)
			this.updateNeighbors = false
		}
		return (
				<div>
					<button onClick={(e) => this.zoomClicked()}>zoom {this.props.map.zoom===1 ? 'in' : 'out'}</button>
					<div style={{margin: '20px'}} ref="threejs"></div>
					<div style={{position: 'absolute', bottom: '10px'}}>{this.props.map.hoveredItem ? this.props.map.hoveredItem.title : ''}</div>
				</div>
				
			)
	}

}