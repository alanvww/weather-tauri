// Footer.js

import React from 'react';

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer>
			<p>
				&copy; {currentYear} Developed & Design by Alan Ren. All rights
				reserved.
			</p>
		</footer>
	);
};

export default Footer;
