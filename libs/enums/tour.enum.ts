export enum TourCategory {
	ADVENTURE = 'ADVENTURE',
	CULTURAL = 'CULTURAL',
	HISTORICAL = 'HISTORICAL',
	BEACH = 'BEACH',
	MOUNTAIN = 'MOUNTAIN',
	CITY = 'CITY',
	CRUISE = 'CRUISE',
}

export enum TourStatus {
	ACTIVE = 'ACTIVE',
	SOLD_OUT = 'SOLD_OUT',
	PAUSED = 'PAUSED',
	DELETED = 'DELETED',
}

export enum TourLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
}

export enum TourLanguage {
	ENGLISH = 'ENGLISH',
	KOREAN = 'KOREAN',
	RUSSIAN = 'RUSSIAN',
	UZBEK = 'UZBEK',
}

export enum TourDifficulty {
	EASY = 'EASY',
	MODERATE = 'MODERATE',
	CHALLENGING = 'CHALLENGING',
}

export enum TourScheduleStatus {
	ACTIVE = 'ACTIVE',
	FULL = 'FULL',
	PAUSED = 'PAUSED',
	DELETED = 'DELETED',
}

export enum BookingStatus {
	PENDING = 'PENDING',
	CONFIRMED = 'CONFIRMED',
	CANCELLED = 'CANCELLED',
	COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
	PENDING = 'PENDING',
	PAID = 'PAID',
	FAILED = 'FAILED',
	REFUNDED = 'REFUNDED',
	CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
	CARD = 'CARD',
	BANK_TRANSFER = 'BANK_TRANSFER',
	KAKAO_PAY = 'KAKAO_PAY',
	NAVER_PAY = 'NAVER_PAY',
	CASH = 'CASH',
}

export enum DestinationStatus {
	ACTIVE = 'ACTIVE',
	PAUSED = 'PAUSED',
	DELETED = 'DELETED',
}

export enum WishlistGroup {
	TOUR = 'TOUR',
	DESTINATION = 'DESTINATION',
}
