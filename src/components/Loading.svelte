<script lang="ts">
	import { isLoading, userUid } from '../lib/stores/userStore';
	import { firebaseConfig } from '../lib/stores/firebaseConfig.js';
	import { getDatabase, ref, update, remove, get, set, onValue } from 'firebase/database';
	import { initializeApp } from 'firebase/app';

	const app = initializeApp(firebaseConfig);
	const database = getDatabase(app);

	const back = async () => {
		$isLoading = false;
		console.log($isLoading);
		const userId = $userUid; 
		const userRef = ref(database, 'waitingRoom/' + userId);
		await remove(userRef); // Removes the current user from the waitingRoom
	};
</script>

{#if $isLoading}
	<div class="waiting-room" style="display: {$isLoading ? 'flex' : 'none'};">
		<div class="loader" />
		<span>正在尋找配對...</span>
		<button
			class="btn variant-filled align-center mt-5 w-3/4 justify-center md:w-1/2"
			type="submit"
			on:click={back}>離開</button
		>
	</div>
{/if}

<style>
	.waiting-room {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}

	.loader {
		border: 5px solid #f3f3f3; /* Light grey */
		border-top: 5px solid #3498db; /* Blue */
		border-radius: 50%;
		width: 50px;
		height: 50px;
		margin-bottom: 5px;
		animation: spin 2s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
