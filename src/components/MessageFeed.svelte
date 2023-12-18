<script lang="ts">
	import type { Message } from '../types/types';
	import MessageBubbleOther from './MessageBubbles/MessageBubbleOther.svelte';
	import MessageBubbleSender from './MessageBubbles/MessageBubbleSender.svelte';
	import { nickname, roomDeleted, chatMode } from '$lib/stores/userStore';
	import StatusBubble from './StatusBubble.svelte';
	import score5 from '../svg/emoji/1.png?url';
	import score4 from '../svg/emoji/2.png?url';
	import score3 from '../svg/emoji/3.png?url';
	import score2 from '../svg/emoji/4.png?url';
	import score1 from '../svg/emoji/5.png?url';
	import { goto } from '$app/navigation';

	export let messages: Message[];
	export let leave = false;
	let showConfirmExitButton = true;
	let headerText = '是否離開聊天室 ?';

	const buttonAlert = () => {
		leave = true;
		headerText = '對此次聊天評價 ?';
		showConfirmExitButton = false;
	};
	const cancel = () => {
		$roomDeleted = false;
		showConfirmExitButton = true;
		leave = false;
		headerText = '是否離開聊天室 ?';
	};

	const handleScoreClick = (score: number) => {
		console.log(`Selected score: ${score}`);
		if(score>0){
			goto('/home');
			$chatMode = false;
			$roomDeleted = false;
		}
	};
</script>

<section class="w-full flex-1 items-center space-y-3 px-4">
	{#if $roomDeleted}
		<div class="card flex flex-col items-center justify-center">
			<header class="card-header text-3xl">
				<h1>{headerText}</h1>
			</header>
			{#if leave}
				<section class="row flex p-4">
					<button class="emoji-button" on:click={() => handleScoreClick(1)}>
						<img src={score1} alt="emoji 1" />
					</button>
					<button class="emoji-button" on:click={() => handleScoreClick(2)}>
						<img src={score2} alt="emoji 2" />
					</button>
					<button class="emoji-button" on:click={() => handleScoreClick(3)}>
						<img src={score3} alt="emoji 3" />
					</button>
					<button class="emoji-button" on:click={() => handleScoreClick(4)}>
						<img src={score4} alt="emoji 4" />
					</button>
					<button class="emoji-button" on:click={() => handleScoreClick(5)}>
						<img src={score5} alt="emoji 5" />
					</button>
				</section>
			{/if}
			{#if showConfirmExitButton}
				<button
					class="btn variant-filled align-center mt-5 w-3/4 justify-center md:w-1/2"
					type="submit"
					on:click={buttonAlert}>確定離開</button
				>
			{/if}
			<button
				class="btn variant-filled align-center far mt-5 w-3/4 justify-center md:w-1/2"
				type="submit"
				on:click={cancel}>取消</button
			>
		</div>
	{/if}

	{#if !$roomDeleted}
		{#each messages as message}
			{#if message.type === 'status-joined' || message.type === 'status-left'}
				<StatusBubble {message} />
			{:else if message.sender !== $nickname}
				<MessageBubbleOther {message} />
			{:else}
				<MessageBubbleSender {message} />
			{/if}
		{/each}
	{/if}
</section>

<style>
	.card {
		margin-top: 30%;
	}
	.far {
		margin-bottom: 15px;
	}
	.emoji-button {
		width: 85px; /* Example size */
		height: 85px; /* Example size */
		margin-left:-12px;
		margin-right:-12px;
		margin-bottom: -25px;
	}
</style>
