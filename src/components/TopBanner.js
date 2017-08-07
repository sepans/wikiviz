import React from 'react'
import '../styles/TopBanner.css'



const TopBanner = (props) =>  {

	return (
		<div className="banner">
			<span className="ffl-logo"><a href="http://fastforwardlabs.com" target="_blank">Fast forward labs</a></span>
			<h1 className="title">{props.appName}</h1>
			<h2 className="subtitle">  Wikipedia with a Map</h2>
			<span className="builtby">
				built @ <a href="http://fastforwardlabs.com" target="_blank">Fast forward labs</a>
			</span>
		</div>
	)
}

export default TopBanner


