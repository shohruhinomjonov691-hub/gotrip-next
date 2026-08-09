import React, { useMemo, useRef, useState } from 'react';
import { Box, Button, FormControl, MenuItem, Stack, Typography, Select, TextField } from '@mui/material';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Editor } from '@toast-ui/react-editor';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios';
import { T } from '../../types/common';
import '@toast-ui/editor/dist/toastui-editor.css';
import { useMutation } from '@apollo/client';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { Message } from '../../enums/common.enum';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';
import { useTranslation } from '../../i18n/useTranslation';

const TuiEditor = () => {
	const { t } = useTranslation();
	const editorRef = useRef<Editor>(null),
		token = getJwtToken(),
		router = useRouter();
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);

	/** APOLLO REQUESTS **/
	const [createboardArticle] = useMutation(CREATE_BOARD_ARTICLE);

	const memoizedValues = useMemo(() => {
		const articleTitle = '',
			articleContent = '',
			articleImage = '';

		return { articleTitle, articleContent, articleImage };
	}, []);

	/** HANDLERS **/
	const uploadImage = async (image: any) => {
		try {
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target) 
				  }`,
					variables: {
						file: null,
						target: 'article',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			memoizedValues.articleImage = responseImage;

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
		}
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const articleTitleHandler = (e: T) => {
		memoizedValues.articleTitle = e.target.value;
	};

	const handleRegisterButton = async () => {
		try {
			const editor = editorRef.current;
			const articleContent = editor?.getInstance().getHTML() as string;
			memoizedValues.articleContent = articleContent;

			if (memoizedValues.articleContent === '' && memoizedValues.articleTitle === '') {
				throw new Error(Message.INSERT_ALL_INPUTS);
			}

			await createboardArticle({
				variables: {
					input: { ...memoizedValues, articleCategory },
				},
			});

			await sweetTopSuccessAlert(t('Article is created successfully'), 700);
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myArticles',
				},
			});
		} catch (err: any) {
			console.log(err);
			sweetErrorHandling(new Error(Message.INSERT_ALL_INPUTS)).then();
		}
	};
	const doDisabledCheck = () => {
		if (memoizedValues.articleContent === '' || memoizedValues.articleTitle === '') {
			return true;
		}
	};

	return (
		<Stack className="article-editor-shell">
			{/* Colours come from the stylesheet (design tokens) — the previous
			    hardcoded `#7f838d` label and `background: white` made these
			    unreadable in dark mode. */}
			<Stack className="article-editor-fields" direction="row" justifyContent="space-evenly">
				<Box component={'div'} className={'form_row article-editor-field'}>
					<Typography className="article-editor-label" component="label" htmlFor="article-category">
						{t('Categories')}
					</Typography>
					<FormControl fullWidth>
						<Select
							id="article-category"
							value={articleCategory}
							onChange={changeCategoryHandler}
							displayEmpty
							inputProps={{ 'aria-label': t('Article category') }}
						>
							<MenuItem value={BoardArticleCategory.FREE}>
								<span>{t('Free')}</span>
							</MenuItem>
							<MenuItem value={BoardArticleCategory.HUMOR}>{t('Humor')}</MenuItem>
							<MenuItem value={BoardArticleCategory.NEWS}>{t('NEWS')}</MenuItem>
							<MenuItem value={BoardArticleCategory.RECOMMEND}>{t('Recommendation')}</MenuItem>
						</Select>
					</FormControl>
				</Box>
				<Box component={'div'} className="article-editor-field">
					<Typography className="article-editor-label" component="label" htmlFor="article-title">
						{t('Title')}
					</Typography>
					<TextField
						fullWidth
						id="article-title"
						onChange={articleTitleHandler}
						placeholder={t('Type a title') as string}
					/>
				</Box>
			</Stack>

				<div className="article-editor-canvas">
				<Editor
					initialValue={t('Type here') as string}
					placeholder={t('Type here') as string}
					previewStyle={'vertical'}
					height={'640px'}
					// @ts-ignore
					initialEditType={'WYSIWYG'}
					toolbarItems={[
						['heading', 'bold', 'italic', 'strike'],
						['image', 'table', 'link'],
						['ul', 'ol', 'task'],
					]}
					ref={editorRef}
					hooks={{
						addImageBlobHook: async (image: any, callback: any) => {
							const uploadedImageURL = await uploadImage(image);
							callback(uploadedImageURL);
							return false;
						},
					}}
					events={{
						load: function (param: any) {},
					}}
				/>
				</div>

			<Stack className="article-editor-submit" direction="row" justifyContent="center">
				<Button
					variant="contained"
					color="primary"
					style={{ margin: '30px', width: '250px', height: '45px' }}
					onClick={handleRegisterButton}
				>
					{t('Register')}
				</Button>
			</Stack>
		</Stack>
	);
};

export default TuiEditor;
