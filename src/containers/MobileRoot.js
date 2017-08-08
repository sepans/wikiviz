import React from 'react'
import '../styles/MobileRoot.css'

const MobileRoot = (props) => {
	return (
		<div className="mobile">
			<span className="ffl-logo"><a href="http://fastforwardlabs.com" target="_blank">Fast forward labs</a></span>
			<h1 className="title">Encartopedia</h1>
			<h2 className="subtitle">  Wikipedia with a Map</h2>
			
			<p><b>Encartopedia</b> helps locating yourself, or to be more precise, 
						locate the subject matter of your curiosity within the universe of Wikipedia articles.</p>
			<img className="screenshot" src="img/screen.png"/>
			<div className="checkback">
			 Please check back on a large screen.
			</div>
		</div>

	)
}

export default MobileRoot