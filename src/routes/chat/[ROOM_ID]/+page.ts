export const ssr = false;

export function load({ params }) {
	return { id: params.ROOM_ID };
}
