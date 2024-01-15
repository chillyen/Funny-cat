<script lang="ts">
	import { currentComponent, NavState } from '$lib/stores/userStore';
	import cardIcon from '../svg/card.svg?url';
	import personalIcon from '../svg/personal.svg?url';
	import scrollIcon from '../svg/arrow.png?url';
	import Personal from '../nav/Personal.svelte';
	import NicknamePrompt from './NicknamePrompt.svelte';

	$currentComponent = 'card';

	let isNavExpanded = false; // 用于跟踪导航栏的展开状态
	let isScrollIconRotated = true;

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
{#if $NavState}
	<div
		class="bottom-nav {isNavExpanded ? '' : 'collapsed'} flex w-full max-w-4xl md:mx-auto md:w-3/4"
	>
		{#if isNavExpanded}
			<button
				class="nav-icon"
				on:click={() => {
					$currentComponent = 'card';
					toggleScrollIconRotation();
				}}
			>
				<img src={cardIcon} class="mx-auto h-7" alt="card" />
				<span class="nav-label">配對</span>
				<!-- {#if $currentComponent === 'card'}<div class="circle" />{/if} -->
			</button>
			<button
				class="nav-icon"
				on:click={() => {
					$currentComponent = 'personal';
					toggleScrollIconRotation();
				}}
			>
				<img src={personalIcon} class="mx-auto h-7" alt="personal" />
				<span class="nav-label">自介</span>
				<!-- {#if $currentComponent === 'personal'}<div class="circle" />{/if} -->
			</button>
		{/if}
		<button class="nav-icon scroll-icon" on:click={toggleScrollIconRotation}>
			<img
				src={scrollIcon}
				class="mx-auto h-7 {isScrollIconRotated ? 'rotated' : 'reserve'}"
				alt="scroll"
			/>
			<span class="nav-label">目錄</span>
		</button>
	</div>
{/if}

<style>
	.bottom-nav {
		display: flex;
		width: 55%;
		justify-content: space-around;
		padding: 1px;
		background-color: white; /* Change this to match your UI */
		border-top: 7px solid rgb(137, 137, 137); /* Light grey border */
		position: fixed;
		bottom: 0;
		margin-bottom: 10px;
		right: 0; /* 从右侧开始 */
		transform: translateX(7%); /* 保持在初始位置 */
		box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1); /* subtle shadow on the top */
		z-index: 1000;
		border-radius: 25px 0px 0px 25px;
		transition: transform 0.4s ease, width 0.35s ease; /* 添加平滑过渡效果 */
		height: 55px;
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
		width: 45px;
		height: 40px;
	}

	.nav-icon {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		transition: opacity 0.1s ease;
		width: auto;
		height: auto;
		margin-top: 5px;
	}

	/* .circle {
		width: 10px;
		height: 10px;
		background-color: rgb(137, 137, 137);
		border-radius: 50%;
		margin-top: 20%;
	} */

	.nav-label {
		display: block; /* 确保文字在图标下方 */
		text-align: center; /* 文字居中对齐 */
		margin-top: -2px; /* 在图标和文字之间添加一些空间 */
		font-size: 0.7rem; /* 文字大小，可根据需要调整 */
		color: #333; /* 文字颜色，可根据需要调整 */
	}
</style>
