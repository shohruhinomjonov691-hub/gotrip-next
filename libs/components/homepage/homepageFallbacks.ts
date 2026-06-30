import { BoardArticleCategory } from '../../enums/board-article.enum';
import { TourCategory, TourLocation } from '../../enums/tour.enum';

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

export const fallbackDestinations = [
	{
		title: 'Seoul Signature Nights',
		location: 'Seoul, Korea',
		image: '/img/banner/cities/SEOUL.webp',
		tours: 18,
		href: `/tour?location=${TourLocation.SEOUL}`,
	},
	{
		title: 'Jeju Coastal Escapes',
		location: 'Jeju Island',
		image: '/img/banner/cities/JEJU.webp',
		tours: 12,
		href: `/tour?location=${TourLocation.JEJU}`,
	},
	{
		title: 'Busan Ocean Routes',
		location: 'Busan, Korea',
		image: '/img/banner/cities/BUSAN.webp',
		tours: 14,
		href: `/tour?location=${TourLocation.BUSAN}`,
	},
	{
		title: 'Gyeongju Heritage Walks',
		location: 'Gyeongju, Korea',
		image: '/img/banner/cities/GYEONGJU.webp',
		tours: 9,
		href: `/tour?location=${TourLocation.GYEONGJU}`,
	},
	{
		title: 'Incheon Gateway Days',
		location: 'Incheon, Korea',
		image: '/img/banner/cities/INCHEON.webp',
		tours: 7,
		href: `/tour?location=${TourLocation.INCHEON}`,
	},
	{
		title: 'Daegu Culture Trails',
		location: 'Daegu, Korea',
		image: '/img/banner/cities/DAEGU.webp',
		tours: 8,
		href: `/tour?location=${TourLocation.DAEGU}`,
	},
];

export const fallbackTours = [
	{
		title: 'Private Seoul Design Walk',
		location: TourLocation.SEOUL,
		category: TourCategory.CITY,
		duration: 1,
		price: 180,
		image: '/img/fiber/img8.jpg',
		people: '2-6 travelers',
		seats: 'Private group',
		href: `/tour?location=${TourLocation.SEOUL}&category=${TourCategory.CITY}`,
	},
	{
		title: 'Jeju Sunrise Coast Escape',
		location: TourLocation.JEJU,
		category: TourCategory.BEACH,
		duration: 2,
		price: 320,
		image: '/img/fiber/img5.jpg',
		people: '2-8 travelers',
		seats: 'Flexible dates',
		href: `/tour?location=${TourLocation.JEJU}&category=${TourCategory.BEACH}`,
	},
	{
		title: 'Gyeongju Royal Heritage Day',
		location: TourLocation.GYEONGJU,
		category: TourCategory.HISTORICAL,
		duration: 1,
		price: 145,
		image: '/img/fiber/img4.jpg',
		people: '1-10 travelers',
		seats: 'Guide-led',
		href: `/tour?location=${TourLocation.GYEONGJU}&category=${TourCategory.HISTORICAL}`,
	},
	{
		title: 'Busan Yacht & Market Evening',
		location: TourLocation.BUSAN,
		category: TourCategory.CRUISE,
		duration: 1,
		price: 240,
		image: '/img/fiber/img6.jpg',
		people: '2-10 travelers',
		seats: 'Small group',
		href: `/tour?location=${TourLocation.BUSAN}&category=${TourCategory.CRUISE}`,
	},
	{
		title: 'Mountain Temple Retreat',
		location: TourLocation.DAEGU,
		category: TourCategory.MOUNTAIN,
		duration: 2,
		price: 280,
		image: '/img/fiber/img7.jpg',
		people: '2-8 travelers',
		seats: 'Seasonal',
		href: `/tour?category=${TourCategory.MOUNTAIN}`,
	},
	{
		title: 'Incheon Island Food Trail',
		location: TourLocation.INCHEON,
		category: TourCategory.CULTURAL,
		duration: 1,
		price: 120,
		image: '/img/fiber/img3.jpg',
		people: '1-8 travelers',
		seats: 'Local host',
		href: `/tour?location=${TourLocation.INCHEON}&category=${TourCategory.CULTURAL}`,
	},
];

export const fallbackArticles = {
	[BoardArticleCategory.NEWS]: [
		{
			title: 'How to plan a seamless first night in Seoul',
			label: 'City guide',
			image: '/img/fiber/img8.jpg',
			href: `/community?articleCategory=${BoardArticleCategory.NEWS}`,
		},
		{
			title: 'Jeju routes that feel private, calm, and coastal',
			label: 'Destination note',
			image: '/img/fiber/img5.jpg',
			href: `/community?articleCategory=${BoardArticleCategory.NEWS}`,
		},
		{
			title: 'What travelers ask before booking guide-led tours',
			label: 'Booking insight',
			image: '/img/fiber/img4.jpg',
			href: `/community?articleCategory=${BoardArticleCategory.NEWS}`,
		},
	],
	[BoardArticleCategory.FREE]: [
		{
			title: 'Share your favorite slow morning in Busan',
			label: 'Traveler board',
			image: '/img/fiber/img6.jpg',
			href: `/community?articleCategory=${BoardArticleCategory.FREE}`,
		},
		{
			title: 'Ask local guides about heritage walks',
			label: 'Community prompt',
			image: '/img/fiber/img7.jpg',
			href: `/community?articleCategory=${BoardArticleCategory.FREE}`,
		},
		{
			title: 'Build a saved-tour shortlist for spring',
			label: 'Wishlist planning',
			image: '/img/fiber/img3.jpg',
			href: `/community?articleCategory=${BoardArticleCategory.FREE}`,
		},
	],
};
