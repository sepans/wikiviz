import React from 'react'
import '../styles/Map.css'

const ArrowLabel = (props) => {
	const location = props.location || [0, 0]
	const fontSize = props.fontSize || '12'
	const opacity = props.opacity
	const dotSize = props.dotSize
	const label = props.label || ''
	const color = props.color || '#000'
	const arrow = props.arrow || false
	const direction = props.direction || 0
	const arrowLenght = !arrow ? 0 : props.arrowLenght || 20 
	const arrowEnd = props.arrowEnd ? [props.arrowEnd[0] - location[0], props.arrowEnd[1] - location[1]] : [arrowLenght, arrowLenght]
	// if(label.indexOf('You ')<0)
	// 	console.log('',  props.arrowLenght, arrowLenght, props)
	const rand =  Math.random()* 0.3 - 0.15
	const pathD = direction===0  ?
					 //`M${arrowEnd[0]},${arrowEnd[1]}L0,0` :
					 //`M${arrowEnd[0]},${arrowEnd[1]}L0,${arrowEnd[1]*2}`
					 `M${arrowEnd[0]},${arrowEnd[1]}C${arrowEnd[0] * (0.6)},${arrowEnd[1] * 0.9}, 0,${arrowEnd[0] * (0.3)}, 0,0` :
					 `M${arrowEnd[0]},${arrowEnd[1]}C${arrowEnd[0] * (0.6)},${arrowEnd[1] * 0.9}, 0,${arrowEnd[0] * (1.3)}, 0,${arrowEnd[1]*2}`
	return (
			<div className="marker"
				style={{top: location[1],
				 		 left: location[0] -2,
				 		 fontSize: fontSize,
				 		 lineHeight: fontSize,
				 		 backgroundColor: arrow ? 'background-color: rgba(0, 0, 0, 0.3)' : 'none',
				 		 opacity: opacity,
				 		 color: color
				 		}}>
				 		{/*<span className="dot"  style={{width: dotSize, height: dotSize}}/>*/}
				 		<div style={{transform: `translate(0,${direction===0  ? 0 : -2.3 * arrowEnd[1]}px)`}}>
						 	<div className='markerLabel' style={{position: 'absolute',top: arrowEnd[1] -1 , left: arrowEnd[0] + 5, width: label.length * fontSize * 0.56}}>{label}</div>
					 		<svg width={Math.abs(2 * arrowEnd[0]) + 5} height={Math.abs(2 * arrowEnd[1]) + 5} 
					 			style={{opacity: arrow ? opacity : 0 , top: 0, left: -3}}>
							  <g className="arrow" transform={`translate(4, ${direction ? 0 : 4})`}>
							  	<path className="arrowShadow" 
							  		d={pathD} />
							  	<path 
							  		d={pathD}
							  		markerEnd="url(#arrow)"/>
							  </g>
							  <defs>
							    <marker
							      id="arrow"
							      markerUnits="strokeWidth"
							      markerWidth="12"
							      markerHeight="12"
							      viewBox="0 0 12 12"
							      refX="6"
							      refY="6"
							      orient="auto">
							      <path d="M2,2 L10,6 L2,10 L6,6 L2,2"></path>
							    </marker>
							  </defs>
							</svg>
						</div>
			</div>
	)
}

export default ArrowLabel