export const fallbackImages = [
	'/img/fiber/img8.jpg',
	'/img/fiber/img5.jpg',
	'/img/fiber/img4.jpg',
	'/img/fiber/img6.jpg',
	'/img/fiber/img7.jpg',
	'/img/fiber/img3.jpg',
];

export const getFallbackImage = (key = 'gotrip') => {
	const total = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
	return fallbackImages[total % fallbackImages.length];
};
