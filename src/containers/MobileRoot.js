import React from 'react'
import '../styles/MobileRoot.css'

const MobileRoot = (props) => {
	return (
		<div className="mobile">
			<span className="mobileffl-logo"><a href="http://fastforwardlabs.com" rel="noopener noreferrer" target="_blank">Fast forward labs</a></span>
			<h1 className="mobiletitle">Encartopedia</h1>
			<h2 className="mobilesubtitle">  Wikipedia with a Map</h2>
			
			<p><b>Encartopedia</b> helps locating yourself, or to be more precise, 
						locate the subject matter of your curiosity within the universe of Wikipedia articles.</p>
			<img className="mobilescreenshot" src="img/screen.png" alt="Encartopedia"/>
			<div className="mobilecheckback">
			 Please check back on a large screen.
			</div>
		</div>

	)
}

export default MobileRoot