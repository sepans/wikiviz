import React from 'react'
import '../styles/HistoryPanel.css'

const HistoryPanel = (props) => {
	const historyList = props.history.map((d, i) => (
			<li key={i}>{d.title}</li>
		))
	return (
			<div  className="history" style={{opacity: props.history.length> 1 ? 1 : 0}}>
				<div className="label">Navigation hisotry:</div>
				<ul style={{transform: props.history.length < 2 ? 'translateY(100%)' : ''}}>
					{historyList}
				</ul>
			</div>
		)
}

export default HistoryPanel