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
		name,
		NavState,
		otherLeave
	} from '$lib/stores/userStore';
	import { firebaseConfig } from '../lib/stores/firebaseConfig.js';
	import { getDatabase, ref, update, remove, get, set, onValue } from 'firebase/database';
	import { initializeApp } from 'firebase/app';
	import Loading from './Loading.svelte';
	import { onMount } from 'svelte';

	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);
	const database = getDatabase(app);
	$otherLeave = false;
	$isLoading = false;
	$chatMode = false;
	const dontCare: string = '不拘';

	export let toJoinRoom: boolean = false;
	export let toCreateRoom: boolean = false;
	export let toggleChatInterface: () => void = () => {};
	$nickname = $name;

	onMount(() => {
		if (auth.currentUser) {
			fetchUserData(auth.currentUser.uid);
			$userUid = auth.currentUser.uid;
		} else {
			alert('用戶未登錄');
			goto('/');
		}
	});

	async function fetchUserData(userId: string) {
		const userRef = ref(database, 'users/' + userId);
		onValue(userRef, (snapshot) => {
			const data = snapshot.val();
			$nickname = data.nickname;
			// 加載用戶資料
		});
		const userPublicRef = ref(database, 'users/' + userId + '/publicProfile');
		onValue(userPublicRef, (snapshot) => {
			const publicdata = snapshot.val();
			$mySex = publicdata.mySex;
			// 加載用戶公共資料
		});
	}

	const getTaiwanTime = () => {
		const now = new Date();
		const taiwanTimeOffset = 8 * 60; // 台灣時區偏移量（分鐘）
		const localTimeOffset = now.getTimezoneOffset(); // 本地時區偏移量（分鐘）
		now.setMinutes(now.getMinutes() + taiwanTimeOffset );
		return now.toISOString();
	};

	const waitingRoom = async () => {
		$NavState = false;
		if ($nickname !== '' && $userUid && $mySex !== '' && $sex !== '') {
			$isLoading = true;
			console.log($isLoading);
			// 確保昵稱非空且用戶已獲得 UID
			const waitingRoomRef = ref(database, 'waitingRoom/' + $userUid);
			const oppsiteSexRoomRef = ref(database, 'oppositeSexWaitingRoom/' + $userUid);
			// 將當前用戶添加到等待區
			await update(waitingRoomRef, {
				name: $nickname,
				mySex: $mySex,
				seeking: $sex,
				joinedAt: Date.now(),
				matched: false,
				id: $userUid
			});
			setupMatchListener();
			findMatchAndCreateRoom();
			onValue(waitingRoomRef, async (snapshot) => {
				if (snapshot.exists()) {
					const userData = snapshot.val();
					if (userData.matched && userData.roomID) {
						// 如果匹配成功，重定向到聊天室
						await remove(waitingRoomRef);
						await update(ref(database, 'chatRooms/' + userData.roomID + '/status/' + $userUid), {
							isActive: true
						});
						$chatMode = true;
						$roomID = userData.roomID;
						goto(`/chat/${userData.roomID}`);
					}
				}
			});

			onValue(oppsiteSexRoomRef, async (snapshot) => {
				if (snapshot.exists()) {
					const userData = snapshot.val();
					if (userData.matched && userData.roomID) {
						// 如果匹配成功，重定向到聊天室
						await remove(oppsiteSexRoomRef);
						await update(ref(database, 'chatRooms/' + userData.roomID + '/status/' + $userUid), {
							isActive: true
						});
						$chatMode = true;
						$roomID = userData.roomID;
						goto(`/chat/${userData.roomID}`);
					}
				}
			});
		} else if ($mySex == '') {
			alert('檢查是否有加入自己的性別');
			$NavState = true;
		} else {
			alert('檢查是否有空格');
			$NavState = true;
		}
	};

	const oppositeSexCreate = async () => {
		const oppositeSexWaitingRoomRef = ref(database, 'oppositeSexWaitingRoom');
		const snapshot = await get(oppositeSexWaitingRoomRef);

		if (snapshot.exists()) {
			let users = snapshot.val();
			let userKeys = Object.keys(users);

			if (userKeys.length == 2) {
				let user1Key = userKeys[0];
				let user2Key = userKeys[1];
				let user1 = users[user1Key];
				let user2 = users[user2Key];

				let roomID = roomGen();

				await update(ref(database, 'oppositeSexWaitingRoom/' + user1Key), {
					matched: true,
					roomID
				});
				await update(ref(database, 'oppositeSexWaitingRoom/' + user2Key), {
					matched: true,
					roomID
				});

				const chatRoomRef = ref(database, 'chatRooms/' + roomID);
				const currentDateTime = getTaiwanTime();;
				// 更新聊天室資訊並包括時間戳
				await update(chatRoomRef, { user1: user1, user2: user2 });
				await update(ref(database, 'chatRooms/' + roomID + '/status/'), {
					startTime: currentDateTime
				});
			}
		}
	};

	const setupMatchListener = async () => {
		const waitingRoomRef = ref(database, 'waitingRoom');
		const oppositeSexWaitingRoomRef = ref(database, 'oppositeSexWaitingRoom');
		const oppositeSexSnapshot = await get(oppositeSexWaitingRoomRef);

		// 檢查 oppositeSexWaitingRoom 是否為空
		if (!oppositeSexSnapshot.exists() || Object.keys(oppositeSexSnapshot.val()).length === 0) {
			const waitingSnapshot = await get(waitingRoomRef);

			if (waitingSnapshot.exists()) {
				let users = waitingSnapshot.val();
				let userKeys = Object.keys(users);

				// 根據 joinAt 屬性對用戶進行排序
				userKeys.sort((a, b) => users[a].joinAt - users[b].joinAt);

				let maleUserKey = userKeys.find(
					(key) => users[key].mySex === '男' && users[key].seeking === '女' && !users[key].matched
				);
				let femaleUserKey = userKeys.find(
					(key) => users[key].mySex === '女' && users[key].seeking === '男' && !users[key].matched
				);

				// 如果找到一男一女用戶
				if (maleUserKey && femaleUserKey) {
					// 移動到 oppositeSexWaitingRoom
					await update(ref(database, 'oppositeSexWaitingRoom/' + maleUserKey), users[maleUserKey]);
					await update(
						ref(database, 'oppositeSexWaitingRoom/' + femaleUserKey),
						users[femaleUserKey]
					);

					// 從原等待室刪除
					await remove(ref(database, 'waitingRoom/' + maleUserKey));
					await remove(ref(database, 'waitingRoom/' + femaleUserKey));

					// 執行配對邏輯
					await oppositeSexCreate();
				}
			}
		}
	};

	const findMatchAndCreateRoom = async () => {
		const waitingRoomRef = ref(database, 'waitingRoom');
		const snapshot = await get(waitingRoomRef);
		if (snapshot.exists()) {
			let users = snapshot.val();
			let userKeys = Object.keys(users);
			// userKeys.sort((a, b) => users[a].joinedAt - users[b].joinedAt);
			userKeys.forEach(async (key) => {
				let user = users[key];
				// console.log(user.seeking === dontCare);
				if (!user.matched) {
					if (user.mySex == user.seeking) {
						// 同性配对逻辑
						console.log('執行');
						let sameSexMatches = userKeys.filter((k) => {
							let potentialMatch = users[k];
							return (
								potentialMatch.mySex === user.mySex &&
								potentialMatch.seeking === user.seeking &&
								!potentialMatch.matched &&
								k !== key
							);
						});

						if (sameSexMatches.length > 0) {
							let randomMatchKey =
								sameSexMatches[Math.floor(Math.random() * sameSexMatches.length)];
							let randomMatch = users[randomMatchKey];
							if (user.joinedAt < randomMatch.joinedAt) {
								let roomID = roomGen();
								await update(ref(database, 'waitingRoom/' + key), { matched: true, roomID });
								await update(ref(database, 'waitingRoom/' + randomMatchKey), {
									matched: true,
									roomID
								});
								const chatRoomRef = ref(database, 'chatRooms/' + roomID);
								const currentDateTime = getTaiwanTime();;
								await update(chatRoomRef, { user1: user, user2: randomMatch });
								await update(ref(database, 'chatRooms/' + roomID + '/status/'), {
									startTime: currentDateTime
								});
							}
						}
						//不拘配對邏輯
					} else if (user.seeking === dontCare) {
						console.log('執行');
						let noMatches = userKeys.filter((k) => {
							let potentialMatch = users[k];
							return potentialMatch.seeking === '不拘' && !potentialMatch.matched && k !== key;
						});
						
						if (noMatches.length > 0) {
							let randomMatchKey = noMatches[Math.floor(Math.random() * noMatches.length)];
							let randomMatch = users[randomMatchKey];
							// 只让加入时间较早的用户负责创建聊天室
							if (user.joinedAt < randomMatch.joinedAt) {
								let roomID = roomGen();
								await update(ref(database, 'waitingRoom/' + key), { matched: true, roomID });
								await update(ref(database, 'waitingRoom/' + randomMatchKey), {
									matched: true,
									roomID
								});
								const chatRoomRef = ref(database, 'chatRooms/' + roomID);
								await update(chatRoomRef, { user1: user, user2: randomMatch });
								const currentDateTime = getTaiwanTime();;
								await update(ref(database, 'chatRooms/' + roomID + '/status/'), {
									startTime: currentDateTime
								});
							}
						}
					}
				}
			});
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
	<div class="top container mx-auto flex flex-col items-center justify-center">
		<label class="label h-20 w-3/4 md:w-1/2">
			<span>匿名名字🖖【可再編輯】:</span>
			<input
				class="input h-10 w-full p-4"
				type="text"
				bind:value={$nickname}
				on:keydown={onPromptKeydown}
			/>
		</label>
		<label class="label h-16 w-3/4 md:w-1/2">
			<span>尋找性別❣️:</span>
			<select class="input h-10 w-full" bind:value={$sex}>
				<option value="男">男♂️</option>
				<option value="女">女♀️</option>
				<option value="不拘">不拘✌️</option>
			</select>
		</label>
		<button
			class="btn variant-filled align-center mt-5 w-1/2 justify-center md:w-1/2"
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
		margin-top: 48%;
	}
</style>
