import React from 'react';
import { useRouter } from 'next/router';
import { IconButton, Stack, Typography } from '@mui/material';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import { motion, useReducedMotion } from 'framer-motion';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface CommunityCardProps {
	boardArticle: BoardArticle;
	size?: string;
	likeArticleHandler: any;
	journal?: boolean;
	featured?: boolean;
}

const CommunityCard = ({ boardArticle, size = 'normal', likeArticleHandler, journal = false, featured = false }: CommunityCardProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const shouldReduceMotion = useReducedMotion();
	const imagePath = boardArticle?.articleImage
		? `${REACT_APP_API_URL}/${boardArticle.articleImage}`
		: '/img/community/communityImg.png';

	const chooseArticleHandler = () => {
		router.push({
			pathname: '/community/detail',
			query: { articleCategory: boardArticle.articleCategory, id: boardArticle._id },
		});
	};

	const goMemberPage = (event: React.MouseEvent, id: string) => {
		event.stopPropagation();
		if (id === user._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	if (!journal) {
		return (
			<Stack sx={{ width: size === 'small' ? '285px' : '317px' }} className="community-general-card-config" onClick={chooseArticleHandler}>
				<Stack className="image-box"><img src={imagePath} alt={boardArticle.articleTitle} className="card-img" /></Stack>
				<Stack className="desc-box" sx={{ marginTop: '-20px' }}>
					<Stack>
						<Typography className="desc" onClick={(event: any) => goMemberPage(event, boardArticle.memberData?._id as string)}>{boardArticle.memberData?.memberNick}</Typography>
						<Typography className="title">{boardArticle.articleTitle}</Typography>
					</Stack>
					<Stack className="buttons">
							<IconButton component="span" color="default" disableRipple tabIndex={-1} aria-hidden="true"><RemoveRedEyeOutlinedIcon /></IconButton><Typography className="view-cnt">{boardArticle.articleViews}</Typography>
							<IconButton color="default" aria-label={`${boardArticle.meLiked?.[0]?.myFavorite ? 'Unlike' : 'Like'} ${boardArticle.articleTitle}`} onClick={(event: any) => likeArticleHandler(event, user, boardArticle._id)}>{boardArticle.meLiked?.[0]?.myFavorite ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}</IconButton><Typography className="view-cnt">{boardArticle.articleLikes}</Typography>
					</Stack>
				</Stack>
				<Stack className="date-box"><Moment className="month" format="MMMM">{boardArticle.createdAt}</Moment><Typography className="day"><Moment format="DD">{boardArticle.createdAt}</Moment></Typography></Stack>
			</Stack>
		);
	}

	return (
		<motion.article className={`journal-article-card ${featured ? 'featured' : ''}`} whileHover={shouldReduceMotion ? undefined : { y: -6 }}>
			<button className="journal-card-link" onClick={chooseArticleHandler} aria-label={`Read ${boardArticle.articleTitle}`}>
				<div className="journal-card-media"><img src={imagePath} alt={boardArticle.articleTitle} /><div className="journal-card-overlay" />
					<span className="journal-card-category">{boardArticle.articleCategory}</span>
					{featured && <span className="journal-card-featured">Featured story</span>}
				</div>
			</button>
			<div className="journal-card-body">
				<div className="journal-card-byline"><button onClick={(event) => goMemberPage(event, boardArticle.memberData?._id as string)}>{boardArticle.memberData?.memberNick || 'GoTrip traveler'}</button><span><Moment format="MMM D, YYYY">{boardArticle.createdAt}</Moment></span></div>
				<button className="journal-card-title" onClick={chooseArticleHandler}>{boardArticle.articleTitle}</button>
				<Typography className="journal-card-excerpt">{boardArticle.articleContent.replace(/<[^>]*>/g, ' ')}</Typography>
				<div className="journal-card-meta"><span><RemoveRedEyeOutlinedIcon />{boardArticle.articleViews}</span><span><ChatBubbleOutlineRoundedIcon />{boardArticle.articleComments}</span>
						<IconButton aria-label={`${boardArticle.meLiked?.[0]?.myFavorite ? 'Unlike' : 'Like'} ${boardArticle.articleTitle}`} onClick={(event: any) => likeArticleHandler(event, user, boardArticle._id)}>{boardArticle.meLiked?.[0]?.myFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}<small>{boardArticle.articleLikes}</small></IconButton>
					<button className="journal-card-read" onClick={chooseArticleHandler} aria-label={`Open ${boardArticle.articleTitle}`}><ArrowOutwardRoundedIcon /></button>
				</div>
			</div>
		</motion.article>
	);
};

export default CommunityCard;
