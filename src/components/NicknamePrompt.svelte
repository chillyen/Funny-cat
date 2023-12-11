<script lang="ts">
	// import type { Profile } from "../types/types";
	import { getAuth, type User } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { sex, userUid, chatMode, nickname, isLoading, roomID } from '$lib/stores/userStore';
	import { firebaseConfig } from '../lib/stores/firebaseConfig.js';
	import { getDatabase, ref, update, remove, get, set, onValue } from 'firebase/database';
	import { initializeApp } from 'firebase/app';
	import Loading from './Loading.svelte';

	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);
	const database = getDatabase(app);

	$isLoading = false;

	export let toJoinRoom: boolean = false;
	export let toCreateRoom: boolean = false;
	export let toggleChatInterface: () => void = () => {};

	const waitingRoom = async () => {
		if ($nickname !== '' && $userUid) {
			$isLoading = true;
			console.log($isLoading);
			// 確保昵稱非空且用戶已獲得 UID
			const waitingRoomRef = ref(database, 'waitingRoom/' + $userUid);
			// 將當前用戶添加到等待區
			await update(waitingRoomRef, {
				name: $nickname,
				seeking: $sex,
				joinedAt: Date.now()
			});
			findMatchAndCreateRoom();
			console.log($roomID);
		} else {
			console.log('用戶昵稱為空或未登入');
		}
	};

	const findMatchAndCreateRoom = async () => {
		const waitingRoomRef = ref(database, 'waitingRoom');
		const snapshot = await get(waitingRoomRef);
		if (snapshot.exists()) {
			let users = snapshot.val();

			// 示例匹配邏輯: 只是一個基本的示例，您需要根據您的需求來定制
			let userKeys = Object.keys(users);
			let matchedUsers = userKeys.slice(0, 2); // 假設選取前兩個用戶進行匹配

			if (matchedUsers.length === 2) {
				let user1 = users[matchedUsers[0]];
				let user2 = users[matchedUsers[1]];
				let roomID = roomGen(); // 使用您已經定義的 roomGen 函數
				const chatRoomRef = ref(database, 'chatRooms/' + roomID);
				await update(chatRoomRef, { user1, user2 }); // 在聊天室中添加用戶信息
				// 移除用戶
				await remove(ref(database, 'waitingRoom/' + matchedUsers[0]));
				await remove(ref(database, 'waitingRoom/' + matchedUsers[1]));
				$chatMode = true;
				goto($nickname !== '' ? `/chat/${roomID}` : '/');
			}
		}
	};

	const connected_ID = () =>
		Date.now().toString(26) +
		Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(26);

	const roomGen = () => {
		$roomID = connected_ID();
		return $roomID;
	};

	const joinRoom = () => {
		if ($nickname !== '') {
			$chatMode = true;
			toggleChatInterface();
		}
	};

	const onPromptKeydown = (event: KeyboardEvent): void => {
		if (['Enter'].includes(event.code)) {
			event.preventDefault();
			if (toJoinRoom) joinRoom();
			if (toCreateRoom) waitingRoom();
		}
	};
</script>

{#if $isLoading}
	<Loading />
{:else}
	<div class="container mx-auto flex h-full flex-col items-center justify-center">
		<label class="label h-20 w-3/4 md:w-1/2">
			<span>匿名名字:</span>
			<input
				class="input h-10 w-full p-4"
				type="text"
				bind:value={$nickname}
				on:keydown={onPromptKeydown}
			/>
		</label>
		<label class="label h-16 w-3/4 md:w-1/2">
			<span>尋找性別:</span>
			<select class="input h-10 w-full" bind:value={$sex}>
				<option value="男">男</option>
				<option value="女">女</option>
				<option value="不拘">不拘</option>
			</select>
		</label>
		<button
			class="btn variant-filled align-center mt-5 w-3/4 justify-center md:w-1/2"
			type="submit"
			on:click={waitingRoom}>隨機配對</button
		>
	</div>
{/if}

<!-- <a
		href={$nickname !== '' ? `/chat/${roomGen()}` : '/'}
		class="btn variant-filled w-15 mt-5 w-3/4 md:w-1/2"
		on:click={waitingRoom}>隨機配對!</a
		goto($nickname !== '' ? `/chat/${roomGen()}` : '/');
	> -->
