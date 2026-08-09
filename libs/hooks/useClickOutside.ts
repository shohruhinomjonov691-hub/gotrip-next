import { RefObject, useEffect } from 'react';

/**
 * Closes an open dropdown/popover on outside click or Escape — the pattern
 * NotificationBell.tsx already implemented ad-hoc (mousedown + keydown
 * listeners, cleaned up on unmount). Centralized here so every dropdown
 * (Home hero Categories/Locations, header language switcher, mobile nav)
 * shares one correct implementation instead of each getting its own
 * one-off attempt. Only attaches listeners while `open` is true.
 */
export function useClickOutside(ref: RefObject<HTMLElement>, open: boolean, onClose: () => void): void {
	useEffect(() => {
		if (!open) return;

		const onPointerDown = (e: MouseEvent | TouchEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) onClose();
		};
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};

		document.addEventListener('mousedown', onPointerDown);
		document.addEventListener('touchstart', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('mousedown', onPointerDown);
			document.removeEventListener('touchstart', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [open, ref, onClose]);
}
