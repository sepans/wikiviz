import React from 'react'
import '../styles/TopBanner.css'



const TopBanner = (props) =>  {

	return (
		<div className="banner">
			<span className="ffl-logo"><a href="http://fastforwardlabs.com" target="_blank">Fast forward labs</a></span>
			<h1 className="title">{props.appName}</h1>
			<h2 className="subtitle">  Wikipedia with a Map</h2>
			<span className="builtby">
				<span href="#" onClick={() => props.aboutClicked()}><a>About</a></span>
				<span>Made by <a href="http://sepans.com/sp"  target="_blank">sepans</a> at <a href="http://fastforwardlabs.com" target="_blank">Fast Forward Labs</a></span>
			</span>
		</div>
	)
}

export default TopBanner


