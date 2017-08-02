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
	const arrowLenght = props.arrowLenght || arrow ? 20 : 0
	const arrowEnd = props.arrowEnd ? [props.arrowEnd[0] - location[0], props.arrowEnd[1] - location[1]] : [arrowLenght, arrowLenght]
	const rand =  Math.random()* 0.3 - 0.15
	const pathD = `M${arrowEnd[0]},${arrowEnd[1]}C${arrowEnd[0] * (0.33 + rand)},${arrowEnd[1]},0,${arrowEnd[0] * (0.66 + rand)},0,0`
	return (
			<div className="marker"
				style={{top: location[1],
				 		 left: location[0],
				 		 fontSize: fontSize,
				 		 lineHeight: fontSize,
				 		 opacity: opacity,
				 		 color: color
				 		}}>
				 		{/*<span className="dot"  style={{width: dotSize, height: dotSize}}/>*/}
					 	<div className='markerLabel' style={{position: 'absolute',top: arrowEnd[1] -5, left: arrowEnd[0] + 5, width: label.length * fontSize * 0.56}}>{label}</div>
				 		<svg width={arrowEnd[0] + 5} height={arrowEnd[1] + 5} 
				 			style={{opacity: opacity, top: 1, left: -4}}>
						  <g className="arrow" transform={`translate(4, 4)`}>
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
	)
}

export default ArrowLabel