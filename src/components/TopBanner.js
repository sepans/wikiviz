import React from 'react'

const TopBanner = () => {
	return (
		<div style={{width: '95%', margin: '20px 25px 0 25px', padding: '5px', border: '1px solid rgba(0, 220, 236, 0.5)'}}>
			<span style={{display: 'inline-block', width: '32px', height: '32px', marginLeft: '2px', textIndent: '-9999px', fontSize: '35px', background: 'url(/img/ff-logo.svg) 0 0 no-repeat'}}>Fast forward labs</span>
			<h1 style={{display: 'inline-block', fontFamily: 'Linux Libertine, Georgia, Times, serif', padding: 0, margin: '0 25px', border: 'none', color: 'rgba(0, 0, 0, 0.7)', fontSize: '150%'}}>Never navigate Wikipedia without a Map Again!</h1>
		</div>
	)
}

export default TopBanner
