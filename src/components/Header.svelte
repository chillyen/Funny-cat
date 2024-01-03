<script lang="ts">
	import type { DrawerSettings } from '@skeletonlabs/skeleton';

	import { drawerStore } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import {
		chatMode,
		exitVoiceChat,
		joinVoiceChat,
		roomCreator,
		micOn
	} from '$lib/stores/userStore';

	import menuIconUrl from '../svg/hamburger-svgrepo-com.svg?url';
	import pChatLogo from '../svg/cat_logo.jpg?url';
	import micOnUrl from '../svg/mic_on.svg?url';
	import micOffUrl from '../svg/mic_off.svg?url';

	const drawerSettings: DrawerSettings = {
		id: 'sidebar',
		position: 'right',
		bgBackdrop: 'backdrop-blur-xl',
		border: 'border border-grey',
		width: 'w-[280px] md:w-[480px]',
		padding: 'p-4',
		rounded: 'rounded-xl'
	};
</script>

<header
	class="border-grey flex w-full flex-row items-center justify-between border-b text-center rounded"
>
	<button
		class="btn"
		on:click={() => {
			$chatMode = false;
			$roomCreator = '';
			if(!$chatMode){
				goto('/')
			}else{
				goto('/home');
				console.log($chatMode);
			}
		}}
	>
		<img src={pChatLogo} class="logo" alt="menu" />
	</button>

	{#if $chatMode}
		<div class="flex gap-3">
			<button
				class={`btn  ${!$micOn ? 'variant-filled-tertiary' : 'bg-green-500'}`}
				on:click={() => {
					console.log($micOn);
					if (!$micOn) {
						$joinVoiceChat();
						$micOn = true;
					} else {
						$exitVoiceChat();
						$micOn = false;
					}
				}}
			>
				<img src={$micOn ? micOnUrl : micOffUrl} class="h-5 w-5" alt="mic on" />
			</button>
			<button
				class="btn variant-filled-secondary icon"
				on:click={() => {
					drawerStore.open(drawerSettings);
				}}
			>
				<img src={menuIconUrl} class="h-5 w-5" alt="menu" />
			</button>
		</div>
	{/if}
</header>

<style>
	.logo {
		height: 45px; /* This is the height you had as 'h-10'. You may need to adjust this based on your requirements */
		width: 45px; /* Make sure the width is the same as the height to create a circle */
		border-radius: 50%; /* This makes the image round */
		object-fit: cover; /* This will ensure that the image covers the space without being distorted */
		display: block; /* To center the image with mx-auto, image should be a block or inline-block */
		border:4px solid rgb(56, 56, 56);
	}
	.rounded {
		border-radius:0px 0px 25px 25px;
		background-color: rgb(172, 164, 164);
		border-bottom: 6px solid rgb(97, 97, 97);
	}
	.icon {
		margin-right: 10px;
	}
</style>
