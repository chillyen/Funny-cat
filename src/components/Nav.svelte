<script lang="ts">
	import { currentComponent } from '$lib/stores/userStore';

	import cardIcon from '../svg/card.svg?url';
	import chatIcon from '../svg/chat.svg?url';
	import dayIcon from '../svg/day.svg?url';
	import personalIcon from '../svg/personal.svg?url';

	import DayMatching from '../nav/DayMatching.svelte';
	import Personal from '../nav/Personal.svelte';
	import NicknamePrompt from './NicknamePrompt.svelte';
	import FriendChat from '../nav/FriendChat.svelte';

	$currentComponent = 'personal';
</script>

{#if $currentComponent === 'card'}
	<NicknamePrompt />
{:else if $currentComponent === 'day'}
	<DayMatching />
{:else if $currentComponent === 'personal'}
	<Personal />
{:else if $currentComponent === 'friend'}
	<FriendChat />
{/if}
<div>
	<div class="bottom-nav flex w-full max-w-4xl md:mx-auto md:w-3/4">
		<button
			class="nav-icon"
			on:click={() => {
				$currentComponent = 'card';
			}}
		>
			<img src={cardIcon} class="mx-auto h-7 " alt="card" />
			{#if $currentComponent === 'card'}<div class="circle"></div>{/if}
		</button>
		<button
			class="nav-icon"
			on:click={() => {
				$currentComponent = 'day';
			}}
		>
			<img src={dayIcon} class="mx-auto h-7" alt="day" />
			{#if $currentComponent === 'day'}<div class="circle"></div>{/if}
		</button>
		<button
			class="nav-icon"
			on:click={() => {
				$currentComponent = 'friend';
			}}
		>
			<img src={chatIcon} class="mx-auto h-7" alt="friend" />
			{#if $currentComponent === 'friend'}<div class="circle"></div>{/if}
		</button>
		<button
			class="nav-icon"
			on:click={() => {
				$currentComponent = 'personal';
			}}
		>
			<img src={personalIcon} class="mx-auto h-7" alt="personal" />
			{#if $currentComponent === 'personal'}<div class="circle"></div>{/if}
		</button>
	</div>
</div>

<style>
	.bottom-nav {
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 7px;
		background-color: white; /* Change this to match your UI */
		border-top: 7px solid rgb(137, 137, 137); /* Light grey border */
		position: fixed;
		bottom: 0px;
		left: 50%; /* Center the navigation bar horizontally */
		transform: translateX(-50%); /* Offset the bar by half its width */
		box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1); /* subtle shadow on the top */
		z-index: 1000;
		border-radius: 25px 25px 0px 0px;
	}

	.nav-icon {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.circle {
		width: 10px;
		height: 10px;
		background-color: rgb(137, 137, 137);
		border-radius: 50%;
		margin-top:20%;
	}

	/* You can add more styles for active state or on click */
</style>
