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
					 	<div className='markerLabel' style={{position: 'absolute',top: '-2.5em', right: arrowEnd[0], width: label.length * fontSize * 0.56}}>{label}</div>
				 		<svg width={arrowLenght + 10} height={arrowLenght + 10} 
				 			style={{opacity: opacity, top: -arrowEnd[1] - 8, left: -arrowEnd[0] - 3}}>
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
						  <g className="arrow" transform={`translate(${arrowEnd[0]/2}, ${arrowEnd[1]/2}) rotate(180) translate(${-arrowEnd[0]/2}, ${-arrowEnd[1]/2})`}>
						  	<path 
						  		d={`M${arrowEnd[0]},${arrowEnd[1]}C${arrowEnd[0] * 0.33},${arrowEnd[1]},0,${arrowEnd[0] * 0.66},0,0`} 
						  		markerEnd="url(#arrow)"/>
						  </g>
						</svg>
			</div>
	)
}

export default ArrowLabel