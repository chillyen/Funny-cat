<script lang="ts">
	import { currentComponent } from '$lib/stores/userStore';
	import cardIcon from '../svg/card.svg?url';
	// import chatIcon from '../svg/chat.svg?url';
	// import dayIcon from '../svg/day.svg?url';
	import personalIcon from '../svg/personal.svg?url';
	import scrollIcon from '../svg/arrow.png?url';

	// import DayMatching from '../nav/DayMatching.svelte';
	import Personal from '../nav/Personal.svelte';
	import NicknamePrompt from './NicknamePrompt.svelte';
	// import FriendChat from '../nav/FriendChat.svelte';

	$currentComponent = 'personal';

	let isNavExpanded = true; // 用于跟踪导航栏的展开状态
	let isScrollIconRotated = false;

	const toggleScrollIconRotation = () => {
		isScrollIconRotated = !isScrollIconRotated;
		closeNav(); // 同时切换导航栏状态
	};
	const closeNav = () => {
		isNavExpanded = !isNavExpanded;
	};
</script>

{#if $currentComponent === 'card'}
	<NicknamePrompt />
{:else if $currentComponent === 'personal'}
	<Personal />
{/if}
<div
	class="bottom-nav {isNavExpanded ? '' : 'collapsed'} flex w-full max-w-4xl md:mx-auto md:w-3/4"
>
	{#if isNavExpanded}
		<button
			class="nav-icon"
			on:click={() => {
				$currentComponent = 'card';
			}}
		>
			<img src={cardIcon} class="mx-auto h-7" alt="card" />
			{#if $currentComponent === 'card'}<div class="circle" />{/if}
		</button>
		<!-- <button
		class="nav-icon"
		on:click={() => {
			$currentComponent = 'day';
		}}
	>
		<img src={dayIcon} class="mx-auto h-7" alt="day" />
		{#if $currentComponent === 'day'}<div class="circle" />{/if}
	</button> -->
		<!-- <button
		class="nav-icon"
		on:click={() => {
			$currentComponent = 'friend';
		}}
	>
		<img src={chatIcon} class="mx-auto h-7" alt="friend" />
		{#if $currentComponent === 'friend'}<div class="circle" />{/if}
	</button> -->
		<button
			class="nav-icon"
			on:click={() => {
				$currentComponent = 'personal';
			}}
		>
			<img src={personalIcon} class="mx-auto h-7" alt="personal" />
			{#if $currentComponent === 'personal'}<div class="circle" />{/if}
		</button>
	{/if}
	<button class="nav-icon scroll-icon "  on:click={toggleScrollIconRotation}>
		<img src={scrollIcon} class="mx-auto h-7 {isScrollIconRotated ? 'rotated' : 'reserve'}" alt="scroll" />
	</button>
</div>

<style>
	.bottom-nav {
		display: flex;
		width: 60%;
		justify-content: space-around;
		padding: 3px;
		background-color: white; /* Change this to match your UI */
		border-top: 7px solid rgb(137, 137, 137); /* Light grey border */
		position: fixed;
		bottom: 0;
		margin-bottom: 7px;
		right: 0; /* 从右侧开始 */
		transform: translateX(7%); /* 保持在初始位置 */
		box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1); /* subtle shadow on the top */
		z-index: 1000;
		border-radius: 25px 0px 0px 25px;
		transition: transform 0.4s ease, width 0.35s ease; /* 添加平滑过渡效果 */
	}

	.scroll-icon img.rotated {
        transform: rotate(-180deg); /* 旋转 180 度 */
        transition: transform 0.4s ease; /* 平滑过渡效果 */
    }


	.bottom-nav.collapsed {
		width: 15%; /* 折叠时的宽度 */
		transform: translateX(18%); /* 折叠时向右移动 */
	}

	.bottom-nav.collapsed .scroll-icon {
		width: 42px;
		height: 42px;
	}

	.nav-icon {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		transition: opacity 0.3s ease;
	}

	.circle {
		width: 10px;
		height: 10px;
		background-color: rgb(137, 137, 137);
		border-radius: 50%;
		margin-top: 20%;
	}
</style>
