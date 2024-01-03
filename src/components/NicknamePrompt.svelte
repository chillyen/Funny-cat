<script lang="ts">
	// import type { Profile } from "../types/types";
	import { getAuth, type User } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import {
		mySex,
		sex,
		userUid,
		chatMode,
		nickname,
		isLoading,
		roomID,
		name
	} from '$lib/stores/userStore';
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
	$nickname = $name;

	const waitingRoom = async () => {
		if ($nickname !== '' && $userUid && $mySex !== '') {
			$isLoading = true;
			console.log($isLoading);
			// 確保昵稱非空且用戶已獲得 UID
			const waitingRoomRef = ref(database, 'waitingRoom/' + $userUid);
			// 將當前用戶添加到等待區
			await update(waitingRoomRef, {
				name: $nickname,
				mySex: $mySex,
				seeking: $sex,
				joinedAt: Date.now(),
				matched: false,
				id:$userUid
			});
			// setupMatchListener();
			findMatchAndCreateRoom();
			onValue(waitingRoomRef, async (snapshot) => {
				if (snapshot.exists()) {
					const userData = snapshot.val();
					if (userData.matched && userData.roomID) {
						// 如果匹配成功，重定向到聊天室
						await remove(waitingRoomRef);
						$chatMode = true;
						$roomID = userData.roomID;
						console.log($roomID);
						goto(`/chat/${userData.roomID}`);
					}
				}
			});
		} else if ($mySex == '') {
			alert('檢查是否有加入自己的性別');
		} else {
			alert('檢查是否有空格');
		}
	};

	const findMatchAndCreateRoom = async () => {
		const waitingRoomRef = ref(database, 'waitingRoom');
		const snapshot = await get(waitingRoomRef);
		if (snapshot.exists()) {
			let users = snapshot.val();
			// 示例匹配邏輯: 只是一個基本的示例，您需要根據您的需求來定制
			let userKeys = Object.keys(users);
			// 假設選取前兩個用戶進行匹配
			userKeys.forEach(async (key) => {
				let user = users[key];
				if (user.seeking === '女' && !user.matched) {
					//只要創建過roomID的人就不會消失
					if (!user.roomID) {
						let roomID = roomGen();
						await update(ref(database, 'waitingRoom/' + key), { matched: false, roomID });
					}
				} else if (user.seeking === '男' && !user.matched) {
					// 为寻找男性的用户寻找已经创建了 roomID 的女性用户
					let maleUsers = userKeys.filter(
						(k) => users[k].seeking === '女' && users[k].roomID && !users[k].matched
					);
					if (maleUsers.length > 0) {
						let randommaleUserKey = maleUsers[Math.floor(Math.random() * maleUsers.length)];
						let maleUser = users[randommaleUserKey];
						await update(ref(database, 'waitingRoom/' + key), {
							matched: true,
							roomID: maleUser.roomID
						});
						await update(ref(database, 'waitingRoom/' + randommaleUserKey), { matched: true }); // 更新男性為匹配狀態
						const chatRoomRef = ref(database, 'chatRooms/' + maleUser.roomID);
						await update(chatRoomRef, { user1: maleUser, user2: user }); // 建立聊天室新增兩個用戶
					}
				}
			});
		}
	};

	const setupMatchListener = () => {
		const userRef = ref(database, 'waitingRoom/' + $userUid);
		onValue(userRef, (snapshot) => {
			if (snapshot.exists()) {
				const userData = snapshot.val();
				if (userData.matched && userData.roomID) {
					// User is matched and should be redirected to the chat room
					$chatMode = true;
					goto(`/chat/${userData.roomID}`);
					// 移除用戶
					remove(userRef);
				}
			}
		});
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
	<div class="top container mx-auto flex flex-col items-center justify-center">
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
			on:click={waitingRoom}>隨機配對 💞</button
		>
	</div>
{/if}

<!-- <a
		href={$nickname !== '' ? `/chat/${roomGen()}` : '/'}
		class="btn variant-filled w-15 mt-5 w-3/4 md:w-1/2"
		on:click={waitingRoom}>隨機配對!</a
		goto($nickname !== '' ? `/chat/${roomGen()}` : '/');
	> -->

<style>
	.top {
		margin-top: 50%;
	}
</style>
