import React from 'react'
import '../styles/Modal.css'


const Modal = (props) => {
	const appName = props.appName
	return (
		<div className="modal" 
			style={{opacity: props.showModal ? 1 : 0, transform: `translateY(${props.showModal ? 0 : 100}%)`}} >
			<div className={`modalConstainer ${props.expandModal ? 'expanded' : ''}`} >
				<span onClick={() => {props.closeModal()}} className="close">close</span>
				<div className="modalContent">
					<p><b>{appName}</b> helps locating yourself, or to be more precise, 
						locate the subject matter of your curiosity within the universe of Wikipedia articles.</p>
					<p>
						Inspired by <a href="http://wiki.polyfra.me/" target="_blank" rel="noopener noreferrer">Wikigalaxy</a>, {appName} augments
						additional semantical navigation possibilities while preserving the experience of reading Wikipedia articles.

					</p>
					<p>
						The Wikipedia panel on the left works similar to Wikipedia.org. 
						You can also use the map to go to neighboring articles, or see the history of your navigation.
						Additionally, hovering on links of the Wikipedia panel show you 
						the location of the target article.
					</p>
					<span className="moreContent">
						<p>
							
						</p>
						<p>
							categorization
						</p>
						<p>
							front end tech
						</p>
						<p>
							Built at <a href="http://fastforwardlabs.com" target="_blank" rel="noopener noreferrer">Fast Forward Labs</a>
						</p>
					</span>
					<span onClick={() => {props.toggleExpand()}} className="more">
						{props.expandModal ? 'less' : 'more'}
					</span>
				</div>
			</div>
		</div>

	)
}

export default Modal