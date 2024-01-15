<script lang="ts">
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import { initializeApp } from 'firebase/app';
	import { getAuth } from 'firebase/auth';
	import { getDatabase, ref, onValue } from 'firebase/database';
	import { firebaseConfig } from '../lib/stores/firebaseConfig.js';
	// import type { User } from '../types/types';
	import { drawerStore, modalStore } from '@skeletonlabs/skeleton';
	import { roomID, peerList, userUid } from '$lib/stores/userStore';
	import type { Profile } from '../types/types';
	import { onMount } from 'svelte';

	interface UserProfile {
		quote: string;
		major: string;
		grade: string;
		mySex: string;
		tonight: string;
		// 更多屬性...
	}

	let otherUserProfile: UserProfile | null = null; // 初始化為 null，表示一開始沒有用戶資料
	let _peerList: Profile[] = [];
	let otherUserId = null;
	$: _peerList = $peerList;
	const roomId = $roomID.replace('/chat/', '');
	// 初始化 Firebase
	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);
	const database = getDatabase(app);

	onMount(async () => {
		if (roomId) {
			const chatRoomRef = ref(database, 'chatRooms/' + roomId);
			onValue(
				chatRoomRef,
				(snapshot) => {
					const chatRoomData = snapshot.val();
					console.log('Chat room data:', chatRoomData); // 添加日志记录以审查数据
					if (chatRoomData && chatRoomData.user1 && chatRoomData.user2) {
						// console.log('User1 ID:', chatRoomData.user1.id);
						// console.log('User2 ID:', chatRoomData.user2.id);
						// console.log('Current User UID:', $userUid);
						otherUserId =
							chatRoomData.user1.id === $userUid ? chatRoomData.user2.id : chatRoomData.user1.id;
						// console.log('Other User ID:', otherUserId);
						fetchOtherUserData(otherUserId);
					} else {
						console.error('Invalid chat room data');
						// 可以進一步處理無效的數據情況
					}
				},
				(error) => {
					console.error('Firebase read error:', error);
					// 處理讀取數據時的錯誤
				}
			);
		}
	});

	async function fetchOtherUserData(userId: string) {
		// console.log('Fetching user data for ID:', userId);
		const publicProfileRef = ref(database, 'users/' + userId + '/publicProfile');
		onValue(
			publicProfileRef,
			(snapshot) => {
				if (snapshot.exists()) {
					const data = snapshot.val();
					// console.log('User data:', data);
					otherUserProfile = {
						quote: data.quote,
						major: data.major,
						grade: data.grade,
						mySex: data.mySex,
						tonight: data.tonight
						// 更多你想顯示的資料
					};
				} else {
					console.error('User data not found for ID:', userId);
				}
			},
			(error) => {
				console.error('Error fetching user data:', error);
			}
		);
	}

	const destroyRoom = () => {
		drawerStore.close();
	};

	const modal: ModalSettings = {
		type: 'confirm',
		title: 'Are you sure?',
		body: 'This action is irreversible, and will render the room inaccessible.',
		response: (r: boolean) => {
			if (r) destroyRoom();
		}
	};
</script>

<section class="">
	<div class="bg-surface-900">
		<div
			class="border-grey flex w-full flex-col items-center justify-between p-4 text-center text-2xl"
		>
			<h3>對方個人資料</h3>
		</div>
		<div class="border-grey flex w-full flex-col items-center justify-between border border-b">
			{#each _peerList as peer}
				<li
					class="bg-surface-600 mx-2 flex h-12 w-full shrink-0 flex-col justify-center rounded-lg px-2 text-sm md:h-14 md:px-3 md:text-base"
				>
					<div class="flex w-fit justify-center">
						<img
							src={`https://api.dicebear.com/6.x/fun-emoji/svg?seed=${peer.name}`}
							alt="avatar"
							class="w-8 rounded-lg md:w-10"
						/>
						<p class="m-auto ml-2 md:ml-4">{peer.name}</p>
					</div>
				</li>
			{/each}
		</div>
	</div>

	<div class="flex flex-col">
		<h1 class="px-6 pb-1 pt-4 text-lg">自我介紹：</h1>
		<div class="px-6">
			<ul
				class="bg-surface-900 bottom-1 flex h-[20rem] w-full flex-col gap-2 overflow-y-auto rounded-lg py-2 md:h-[30rem] md:gap-3 md:py-3"
			>
				{#if otherUserProfile}
					<h3 class="m-auto ml-2 md:ml-4 pl-2">我的話：</h3>
					<li
						class="bg-surface-600 mx-2 flex h-12 w-8/9  shrink-0 flex-col justify-center rounded-lg px-2 text-sm md:h-14 md:px-3 md:text-base"
					>
						<div class="flex w-fit flex-col justify-center">
							<p class="m-auto ml-2 md:ml-4 mt-1 mb-1">{otherUserProfile.quote}</p>
						</div>
					</li>
					<h3 class="m-auto ml-2 md:ml-4 pl-2">系所：</h3>
					<li
						class="bg-surface-600 mx-2 flex h-12 w-8/9 shrink-0 flex-col justify-center rounded-lg px-2 text-sm md:h-14 md:px-3 md:text-base"
					>
						<div class="flex w-fit flex-col justify-center">
							<p class="m-auto ml-2 md:ml-4 mt-1 mb-1">{otherUserProfile.major}</p>
						</div>
					</li>
					<h3 class="m-auto ml-2 md:ml-4 pl-2">年級：</h3>
					<li
						class="bg-surface-600 mx-2 flex h-12 w-8/9  shrink-0 flex-col justify-center rounded-lg px-2 text-sm md:h-14 md:px-3 md:text-base"
					>
						<div class="flex w-fit flex-col justify-center">
							<p class="m-auto ml-2 md:ml-4 mt-1 mb-1">{otherUserProfile.grade}</p>
						</div>
					</li>
					<h3 class="m-auto ml-2 md:ml-4 pl-2">性別：</h3>
					<li
						class="bg-surface-600 mx-2 flex h-12 w-8/9  shrink-0 flex-col justify-center rounded-lg px-2 text-sm md:h-14 md:px-3 md:text-base"
					>
						<div class="flex w-fit flex-col justify-center">
							<p class="m-auto ml-2 md:ml-4 mt-1 mb-1">{otherUserProfile.mySex}</p>
						</div>
					</li>
					<h3 class="m-auto ml-2 md:ml-4 pl-2">今晚我想來點：</h3>
					<li
						class="bg-surface-600 mx-2 flex h-12 w-8/9  shrink-0 flex-col justify-center rounded-lg px-2 text-sm md:h-14 md:px-3 md:text-base"
					>
						<div class="flex w-fit flex-col justify-center">
							<p class="m-auto ml-2 md:ml-4 mt-1 mb-1">{otherUserProfile.tonight}</p>
						</div>
					</li>
				{:else}
					<li
						class="bg-surface-600 mx-2 flex h-12 w-8/9  shrink-0 flex-col justify-center rounded-lg px-2 text-sm md:h-14 md:px-3 md:text-base"
					>
						<div class="flex w-fit justify-center">
							<p class="m-auto ml-2 md:ml-4 mt-1 mb-1 pl-2">用戶資料正在加載...</p>
						</div>
					</li>
				{/if}
			</ul>
		</div>
	</div>
</section>
