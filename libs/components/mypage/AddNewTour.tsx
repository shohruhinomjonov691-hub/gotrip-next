import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { CREATE_TOUR } from '../../../apollo/user/mutation';
import { TourCategory, TourDifficulty, TourLanguage, TourLocation } from '../../enums/tour.enum';
import { TourInput } from '../../types/tour/tour.input';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';

const initialInput: TourInput = {
	tourCategory: TourCategory.CITY,
	tourLocation: TourLocation.SEOUL,
	tourTitle: '',
	tourPrice: 0,
	tourDuration: 1,
	tourMaxPeople: 10,
	tourMinPeople: 1,
	tourAvailableSeats: 10,
	tourImages: [],
	tourDesc: '',
	tourMeetingPoint: '',
	tourLanguage: TourLanguage.ENGLISH,
	tourDifficulty: TourDifficulty.EASY,
};

const AddNewTour = () => {
	const [input, setInput] = useState<TourInput>(initialInput);
	const [createTour] = useMutation(CREATE_TOUR);

	const changeHandler = (key: keyof TourInput, value: string | number) => {
		setInput({ ...input, [key]: value });
	};

	const submitHandler = async () => {
		try {
			await createTour({ variables: { input } });
			setInput(initialInput);
			await sweetMixinSuccessAlert('Tour created successfully.');
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<Stack spacing={2} sx={{ p: 2 }}>
			<Typography fontSize={28} fontWeight={800}>
				Add Tour
			</Typography>
			<TextField label="Tour title" value={input.tourTitle} onChange={(event) => changeHandler('tourTitle', event.target.value)} />
			<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
				<TextField
					select
					fullWidth
					label="Category"
					value={input.tourCategory}
					onChange={(event) => changeHandler('tourCategory', event.target.value)}
				>
					{Object.values(TourCategory).map((item) => (
						<MenuItem key={item} value={item}>
							{item}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					fullWidth
					label="Location"
					value={input.tourLocation}
					onChange={(event) => changeHandler('tourLocation', event.target.value)}
				>
					{Object.values(TourLocation).map((item) => (
						<MenuItem key={item} value={item}>
							{item}
						</MenuItem>
					))}
				</TextField>
			</Stack>
			<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
				<TextField
					type="number"
					fullWidth
					label="Price"
					value={input.tourPrice}
					onChange={(event) => changeHandler('tourPrice', Number(event.target.value))}
				/>
				<TextField
					type="number"
					fullWidth
					label="Duration"
					value={input.tourDuration}
					onChange={(event) => changeHandler('tourDuration', Number(event.target.value))}
				/>
				<TextField
					type="number"
					fullWidth
					label="Available seats"
					value={input.tourAvailableSeats}
					onChange={(event) => changeHandler('tourAvailableSeats', Number(event.target.value))}
				/>
			</Stack>
			<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
				<TextField
					type="number"
					fullWidth
					label="Min travelers"
					value={input.tourMinPeople}
					onChange={(event) => changeHandler('tourMinPeople', Number(event.target.value))}
				/>
				<TextField
					type="number"
					fullWidth
					label="Max travelers"
					value={input.tourMaxPeople}
					onChange={(event) => changeHandler('tourMaxPeople', Number(event.target.value))}
				/>
			</Stack>
			<TextField
				label="Meeting point"
				value={input.tourMeetingPoint}
				onChange={(event) => changeHandler('tourMeetingPoint', event.target.value)}
			/>
			<TextField
				multiline
				minRows={4}
				label="Description"
				value={input.tourDesc}
				onChange={(event) => changeHandler('tourDesc', event.target.value)}
			/>
			<Button variant="contained" onClick={submitHandler} disabled={!input.tourTitle || input.tourPrice <= 0}>
				Create tour
			</Button>
		</Stack>
	);
};

export default AddNewTour;
