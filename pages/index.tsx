import { NextPage } from 'next';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import GthStats from '../libs/components/homepage-html/GthStats';
import GthCategories from '../libs/components/homepage-html/GthCategories';
import GthDestinations from '../libs/components/homepage-html/GthDestinations';
import GthPlanTrip from '../libs/components/homepage-html/GthPlanTrip';
import GthAbout from '../libs/components/homepage-html/GthAbout';
import GthServices from '../libs/components/homepage-html/GthServices';
import GthMostPopularTours from '../libs/components/homepage-html/GthMostPopularTours';
import GthNewTours from '../libs/components/homepage-html/GthNewTours';
import GthGuides from '../libs/components/homepage-html/GthGuides';
import GthTestimonials from '../libs/components/homepage-html/GthTestimonials';
import GthBadgeMarquee from '../libs/components/homepage-html/GthBadgeMarquee';
import GthArticles from '../libs/components/homepage-html/GthArticles';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	return (
		<Stack className={'home-page'}>
			<GthStats />
			<GthCategories />
			<GthDestinations />
			<GthAbout />
			<GthPlanTrip />
			<GthServices />
			<GthMostPopularTours />
			<GthNewTours />
			<GthGuides />
			<GthTestimonials />
			<GthBadgeMarquee />
			<GthArticles />
		</Stack>
	);
};

export default withLayoutMain(Home);
