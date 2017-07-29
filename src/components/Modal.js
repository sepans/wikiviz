import React from 'react'
import '../styles/Modal.css'


const Modal = (props) => {
	const appName = props.appName
	return (
		<div className="modal" 
			style={{opacity: props.showModal ? 1 : 0, transform: `translateY(${props.showModal ? 0 : 100}%)`}} >
			<div className="modalConstainer" >
				<span onClick={() => {props.closeModal()}} className="close">close</span>
				<div className="modalContent">
					<p><b>{appName}</b> helps locating yourself, or to be more precise, 
						locate the subject matter of your curiosity within the universe of Wikipedia articles.</p>
					<p>
						<b>{appName}</b> is a redesign of <a href="http://wiki.polyfra.me/" target="_blank">Wikigalaxy</a> to 
						make the experience of reading Wikipedia articles the same, while adding a map and additional ways of navigation. 

					</p>
					<p>
						You can click through the Wikipedia window links to navigate as normal, plus hovering on links will show you 
						the location of the target article. You can also use the map to go to neighboring articles.
					</p>
				</div>
			</div>
		</div>

	)
}

export default Modal