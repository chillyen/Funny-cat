import { roomID } from './userStore';

const connected_ID = () =>
	Date.now().toString(26) +
	Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(26);

const roomGen = () => {
	$roomID = connected_ID();
	return $roomID;
};