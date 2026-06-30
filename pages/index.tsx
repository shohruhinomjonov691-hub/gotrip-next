import { NextPage } from 'next';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import TopAgents from '../libs/components/homepage/TopAgents';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import TourHighlights from '../libs/components/homepage/TourHighlights';
import { Direction } from '../libs/enums/common.enum';
import DestinationHighlights from '../libs/components/homepage/DestinationHighlights';
import TravelerReviews from '../libs/components/homepage/TravelerReviews';
import GuideCtaNewsletter from '../libs/components/homepage/GuideCtaNewsletter';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	return (
		<Stack className={'home-page'}>
			<DestinationHighlights />
			<TourHighlights title="Elite Tour Collection" sort="tourRank" direction={Direction.DESC} limit={4} />
			<TopAgents />
			<TravelerReviews />
			<GuideCtaNewsletter />
		</Stack>
	);
};

export default withLayoutMain(Home);
