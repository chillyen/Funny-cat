<script lang="ts">
	// import type { Profile } from "../types/types";
	import {
		getAuth,
		signInWithEmailAndPassword,
		sendEmailVerification,
		type User
	} from 'firebase/auth';
	import { goto } from '$app/navigation';
	import {
		sex,
		major,
		userUid,
		chatMode,
		nickname,
		roomCreator,
		roomDeleted,
		roomID
	} from '$lib/stores/userStore';
	import { firebaseConfig } from '../lib/stores/firebaseConfig.js';
	import { getDatabase, ref, update, get, set, onDisconnect, onValue } from 'firebase/database';
	import { initializeApp } from 'firebase/app';

	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);
	const database = getDatabase(app);

	export let toJoinRoom: boolean = false;
	export let toCreateRoom: boolean = false;
	export let toggleChatInterface: () => void = () => {};

	const createRoom = async () => {
		if ($nickname !== '' && $userUid) {
			// 確保昵稱非空且用戶已獲得 UID
			const waitingRoomRef = ref(database, 'waitingRoom/' + $userUid);
			// 將當前用戶添加到等待區
			await set(waitingRoomRef, {
				name: $nickname,
				uid: $userUid,
				seeking: $sex, // 可以加入用戶尋找的性別等其他資訊
				joinedAt: Date.now() // 記錄加入時間
			});
			// 接下來的配對邏輯...
		} else {
			console.log('用戶昵稱為空或未登入');
		}
	};

	const generateRoomID = () =>
		Date.now().toString(26) +
		Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(26);

	const roomGen = () => {
		$roomID = generateRoomID();
		return $roomID;
	};

	const joinRoom = () => {
		if ($nickname !== '') {
			$chatMode = true;
			toggleChatInterface();
		}
	};

	// const createRoom = () => {
	// 	if ($nickname !== '') {
	// 		$chatMode = true;
	// 		$roomDeleted = false;
	// 		$roomCreator = $nickname;
	// 		console.log('');
	// 	}
	// 	goto($nickname !== '' ? `/chat/${roomGen()}` : '/');
	// };

	const onPromptKeydown = (event: KeyboardEvent): void => {
		if (['Enter'].includes(event.code)) {
			event.preventDefault();
			if (toJoinRoom) joinRoom();
			if (toCreateRoom) createRoom();
		}
	};
</script>

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
	<a
		href={$nickname !== '' ? `/chat/${roomGen()}` : '/'}
		class="btn variant-filled w-15 mt-5 w-3/4 md:w-1/2"
		on:click={createRoom}>隨機配對!</a
	>
	<!-- {#if toJoinRoom}
		<button class="btn variant-filled mt-5 w-3/4 md:w-1/2" on:click={joinRoom}>
			Join this Chat Room!
		</button>
	{/if} -->
</div>
