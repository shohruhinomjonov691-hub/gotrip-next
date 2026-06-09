import { NextPage } from 'next';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import TopAgents from '../libs/components/homepage/TopAgents';
import Events from '../libs/components/homepage/Events';
import { Stack } from '@mui/material';
import Advertisement from '../libs/components/homepage/Advertisement';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import TourHighlights from '../libs/components/homepage/TourHighlights';
import { Direction } from '../libs/enums/common.enum';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {  
		return (
			<Stack className={'home-page'}>
				<TourHighlights title="Trending tours" sort="tourViews" direction={Direction.DESC} />
				<Advertisement />
				<TourHighlights title="Top rated tours" sort="tourRank" direction={Direction.DESC} />
				<TopAgents />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<TourHighlights title="Trending tours" sort="tourViews" direction={Direction.DESC} />
				<TourHighlights title="Popular tours" sort="tourLikes" direction={Direction.DESC} />
				<Advertisement />
				<TourHighlights title="Top rated tours" sort="tourRank" direction={Direction.DESC} />
				<TopAgents />
				<Events />
				<CommunityBoards />
			</Stack>
		);
	}
};

export default withLayoutMain(Home);
