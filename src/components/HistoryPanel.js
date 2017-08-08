import React from 'react'
import '../styles/HistoryPanel.css'

const HistoryPanel = (props) => {
	const historyList = props.history.map(d => (
			<li key={d.title}>{d.title}</li>
		))
	return (
			<div  className="history">
				<div className="label">Navigation hisotry:</div>
				<ul style={{transform: props.history.length < 2 ? 'translateY(100%)' : ''}}>
					{historyList}
				</ul>
			</div>
		)
}

export default HistoryPanel