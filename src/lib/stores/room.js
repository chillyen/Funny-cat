<script lang="ts">
import {roomID} from '../stores/userStore';


const connected_ID = () =>
	Date.now().toString(26) +Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(26);

export const roomGen = () => {
	$roomID = connected_ID();
	return $roomID;
};

</script>
