import React from 'react'
import '../styles/TopBanner.css'



const TopBanner = (props) =>  {

	return (
		<div className="banner">
			<span className="ffl-logo">Fast forward labs</span>
			<h1 className="title">{props.appName}</h1>
			<h2 className="subtitle"> -  Wikipedia with a Map</h2>
		</div>
	)
}

export default TopBanner


