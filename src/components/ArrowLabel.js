import React from 'react'
import '../styles/Map.css'

const ArrowLabel = (props) => {
	const location = props.location || [0, 0]
	const fontSize = props.fontSize || '12px'
	const opacity = props.opacity || 1
	const dotSize = props.dotSize
	const label = props.label || ''
	const color = props.color || '#000'
	return (
			<div className="marker"
				style={{top: location[1],
				 		 left: location[0],
				 		 fontSize: fontSize,
				 		 lineHeight: fontSize,
				 		 opacity: opacity,
				 		 color: color
				 		}}>
				 		<span className="dot"  style={{width: dotSize, height: dotSize}}/>
				 		{label}
			</div>
	)
}

export default ArrowLabel