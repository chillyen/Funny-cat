<script lang="ts">
	import { fade } from 'svelte/transition';
	export let showToast = false;
	export let progress = 0;

	$: if (!showToast) {
		showNotification();
	}

	function showNotification() {
        console.log("顯示")
		progress = 0;
		setTimeout(() => {
			progress = 100;
		}, 100); // 立即开始动画
		setTimeout(() => {
			showToast = false;
		}, 5000); // 5秒后隐藏通知
	}

	function closeNotification() {
		showToast = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			closeNotification();
		}
	}
</script>

{#if showToast}
	<div class="toast" in:fade>
		<div class="toast-content">
			<i class="fas fa-solid fa-check check" />
			<div class="message">
				<span class="text text-1">提醒</span>
				<span class="text text-2">請確認你的Email</span>
			</div>
		</div>
		<i
			class="fa-solid fa-xmark close"
			on:click={closeNotification}
			on:keydown={handleKeydown}
			tabindex="0"
			role="button"
			aria-label="Close"
		/>
		<div class="progress" style="width: {progress}%;" />
	</div>
{/if}

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		font-family: 'Poppins', sans-serif;
	}

	.toast {
		position: absolute;
		top: 25px;
		right: 30px;
		border-radius: 12px;
		background: #fff;
		padding: 20px 35px 20px 25px;
		box-shadow: 0 6px 20px -5px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		transform: translateX(calc(100% + 30px));
		transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.35);
	}

	.toast .toast-content {
		display: flex;
		align-items: center;
	}

	.toast-content .check {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 35px;
		min-width: 35px;
		background-color: #4070f4;
		color: #fff;
		font-size: 20px;
		border-radius: 50%;
	}

	.toast-content .message {
		display: flex;
		flex-direction: column;
		margin: 0 20px;
	}

	.message .text {
		font-size: 16px;
		font-weight: 400;
		color: #666666;
	}

	.message .text.text-1 {
		font-weight: 600;
		color: #333;
	}

	.toast .close {
		position: absolute;
		top: 10px;
		right: 15px;
		padding: 5px;
		cursor: pointer;
		opacity: 0.7;
	}

	.toast .close:hover {
		opacity: 1;
	}

	.toast .progress {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 3px;
		width: 100%;
	}

	.toast .progress:before {
		content: '';
		position: absolute;
		bottom: 0;
		right: 0;
		height: 100%;
		width: 100%;
		background-color: #4070f4;
	}

	@keyframes progress {
		100% {
			right: 100%;
		}
	}
</style>
