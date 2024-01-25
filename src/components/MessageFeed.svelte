<script lang="ts">
	import type { Message } from '../types/types';
	import MessageBubbleOther from './MessageBubbles/MessageBubbleOther.svelte';
	import MessageBubbleSender from './MessageBubbles/MessageBubbleSender.svelte';
	import {
		nickname,
		roomDeleted,
		chatMode,
		leaveMode,
		peerList,
		NavState,
		otherLeave,
		userUid,
		roomID,
		peerConnection
	} from '$lib/stores/userStore';
	import { firebaseConfig } from '../lib/stores/firebaseConfig.js';
	import { getDatabase, ref, update, remove, get, set, onValue } from 'firebase/database';
	import { initializeApp } from 'firebase/app';
	import { getAuth, type User } from 'firebase/auth';
	import StatusBubble from './StatusBubble.svelte';
	import score5 from '../svg/emoji/1.png?url';
	import score4 from '../svg/emoji/2.png?url';
	import score3 from '../svg/emoji/3.png?url';
	import score2 from '../svg/emoji/4.png?url';
	import score1 from '../svg/emoji/5.png?url';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { joinRoom } from 'trystero';

	const config = {
		iceServers: [
			{
				urls: 'stun:stun-chillyen.ddns.net' // STUN server
			},
			{
				urls: 'turn:turn-chillyen.ddns.net', // TURN server
				username: 'guest',
				credential: 'somepassword'
			}
		],
		appId: 'FunnyCat-rooms'
	};

	// const config = { appId: 'FunnyCat-rooms' };
	let room = joinRoom(config, $roomID);

	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);
	const database = getDatabase(app);

	export let messages: Message[] = [];
	export let leave = false;
	export let cancelButton = true;
	let showConfirmExitButton = true;
	let headerText = '離開聊天室 ?';
	$otherLeave = true;
	$peerConnection = false;

	interface UserStatus {
		isActive: boolean;
	}

	onMount(() => {
		console.log('開始偵測');
		setTimeout(watchRoomStatus, 3000);
	});

	const getTaiwanTime = () => {
		const now = new Date();
		const taiwanTimeOffset = 8 * 60; // 台灣時區偏移量（分鐘）
		const localTimeOffset = now.getTimezoneOffset(); // 本地時區偏移量（分鐘）
		now.setMinutes(now.getMinutes() - localTimeOffset);
		return now.toISOString();
	};

	const updateIsActiveStatus = async (status: boolean) => {
		const roomId = $roomID.replace('/chat/', '');
		const currentDateTime = getTaiwanTime();
		const userRef = ref(database, 'chatRooms/' + roomId + '/status/' + $userUid);
		const userStart = ref(database, 'chatRooms/' + roomId + '/status/');

		// 先獲取 startTime
		const snapshot = await get(userStart);
		if (snapshot.exists()) {
			const userData = snapshot.val();
			const startTime = userData.startTime ? new Date(userData.startTime).getTime() : null;

			// 更新 isActive 狀態和 FinishTime
			await update(userRef, { isActive: status, FinishTime: currentDateTime });

			// 如果有有效的 startTime，計算總時間
			if (startTime) {
				const finishTime = new Date(currentDateTime).getTime();
				const duration = (finishTime - startTime) / 1000; // 秒
				// 更新使用時間
				await update(userRef, { duration: duration + 's' });
			}
		}
	};

	const buttonAlert = () => {
		leave = true;
		headerText = '對此次聊天評價 ?';
		showConfirmExitButton = false;
	};
	const cancel = () => {
		$leaveMode = false;
		$roomDeleted = false;
		showConfirmExitButton = true;
		leave = false;
		headerText = '是否離開聊天室 ?';
	};

	const handleScoreClick = async (score: number) => {
		console.log(`Selected score: ${score}`);
		if (score > 0) {
			$peerList = [];
			await updateIsActiveStatus(false);
			goto('/home');
			$chatMode = false;
			$leaveMode = false;
			$roomDeleted = false;
			$NavState = true;
			$otherLeave = true;
			$peerConnection = true;
			if ($peerConnection) {
				room.leave();
				console.log($peerConnection);
				console.log('執行peerconnection 斷線:');
				$peerConnection = false;
			}
		}
	};

	const watchRoomStatus = () => {
		const roomId = $roomID.replace('/chat/', '');
		const roomStatusRef = ref(database, 'chatRooms/' + roomId + '/status');
		onValue(roomStatusRef, (snapshot) => {
			if (snapshot.exists()) {
				const roomData = snapshot.val();
				const userStatuses = Object.entries(roomData).filter(([key, _]) => key !== 'startTime');
				// Check isActive for each user status, ignoring the uid
				// 使用 `.some` 方法檢查是否有任何使用者不活躍
				const allInactive = userStatuses.some(([_, userData]) => {
					const user = userData as UserStatus;
					return !user.isActive;
				});
				if (allInactive) {
					console.log('執行退出');
					headerText = '對方已離開聊天室';
					$otherLeave = false;
					$leaveMode = true;
					$roomDeleted = true;
					$chatMode = false;
					cancelButton = false;
					buttonAlert();
				}
			}
		});
	};

	// watchRoomStatus();

	// window.onbeforeunload = () => {
	// 	const userRef = ref(database, 'chatRooms/' + $roomID + '/status/' + $userUid);
	// 	// 由於 onbeforeunload 不支持異步操作，這裡只能同步執行
	// 	// 但不保證會在頁面關閉前完成
	// 	update(userRef, { isActive: false });

	// 	// 返回一個字符串將顯示標準的離開確認對話框
	// 	return '您確定要離開此頁面嗎？';
	// };
</script>

<section class="w-full flex-1 items-center space-y-1 px-4">
	{#if $leaveMode}
		<div class="card flex flex-col items-center justify-center">
			<header class="card-header text-3xl">
				<h1>{headerText}</h1>
			</header>
			{#if leave}
				<section class="row mb-3 flex p-4">
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
				{#if !$otherLeave}
					<span class="mb-2 flex items-center text-2xl">【對方已離開👋】</span>
				{/if}
			{/if}
			{#if showConfirmExitButton}
				<button
					class="btn variant-filled align-center mt-5 w-3/4 justify-center md:w-1/2"
					type="submit"
					on:click={buttonAlert}>確定離開</button
				>
			{/if}
			{#if cancelButton}
				<button
					class="btn variant-filled align-center far mt-5 w-3/4 justify-center md:w-1/2"
					type="submit"
					on:click={cancel}>取消</button
				>
			{/if}
		</div>
	{/if}

	{#if !$leaveMode}
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
		margin-left: -12px;
		margin-right: -12px;
		margin-bottom: -25px;
	}
</style>
