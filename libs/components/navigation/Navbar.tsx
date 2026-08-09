import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { getJwtToken, updateUserInfo } from '../../auth';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';

/** Global navigation entry — one place-stable chrome for every consumer page. */
const Navbar = () => {
	const device = useDeviceDetect();

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	return device === 'mobile' ? <MobileNav /> : <DesktopNav />;
};

export default Navbar;
