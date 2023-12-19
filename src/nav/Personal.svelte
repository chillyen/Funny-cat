<script lang="ts">
	import edit from '../svg/edit.svg?url';
	import { initializeApp } from 'firebase/app';
	import { getAuth } from 'firebase/auth';
	import { getDatabase, ref, update, set, onValue } from 'firebase/database';
	import { firebaseConfig } from '../lib/stores/firebaseConfig.js';
	import { quote, userUid, name, major, tonight, grade, mySex } from '$lib/stores/userStore';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	// 初始化 Firebase
	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);
	const database = getDatabase(app);

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
			$name = data.nickname;
			$quote = data.quote || '在這裡設置您的名言';
			$major = data.major;
			// 加載其他用戶數據，如性別等
		});
	}

	async function updateQuote(newQuote: string) {
		const userUidValue = $userUid; // 获取存储中的 userUid
		// await set(ref(database, 'users/' + userUidValue + '/quote'), newQuote);
	}

	const editProfile = () => {
		console.log("按下按鈕")
	};
</script>

<section class="w-full flex-1 flex-col items-center space-y-3 px-5">
	<div class="card flex items-center justify-center">
		<header class="card-header flex text-2xl">
			<h1>歡迎, {$name} 👋🏻</h1>
		</header>
	</div>

	<section class="text-size1 px-4.5 w-full flex-1 items-center space-y-1">
		<span class=" flex items-center pl-2">關於我🤙：</span>
		<div class="card card-quote flex">
			<div class="quote-text">
				<h3>{$quote}</h3>
			</div>
		</div>
	</section>

	<section class="text-size px-4.5 w-full flex-1 items-center space-y-1">
		<span class=" flex items-center pl-2">個人ID🪪：</span>
		<div class="card card-quote flex justify-center">
			<div class="quote-text">
				<h3>
					{$userUid}
				</h3>
			</div>
		</div>
	</section>

	<section class="text-size px-4.5 w-full flex-1 items-center space-y-1">
		<span class=" flex items-center pl-2">系級🎓：</span>
		<div class="card card-quote flex">
			<div class="quote-text">
				<h3>
					{$major}
				</h3>
			</div>
		</div>
	</section>

	<section class="text-size px-4.5 w-full flex-1 items-center space-y-3">
		<span class=" flex items-center pl-2">我的標籤🏷️：</span>
		<div class="card card-quote flex">
			<div class="quote-text flex">
				<select class="input input-width ml-1 h-10 w-full" bind:value={$grade}>
					<option value="bachelor">大學🏫</option>
					<option value="master">碩班🏛️</option>
					<option value="phd">博士🏟️</option>
				</select>
				<select class="input input-width ml-1.5 h-10 w-full" bind:value={$tonight}>
					<option value="bad">單身可壞壞😈</option>
					<option value="couple">死會不缺愛💔</option>
					<option value="chat">單身可 +賴💬</option>
				</select>
			</div>
		</div>
	</section>
	<section class="text-size px-4.5 w-full justify-center items-center space-y-3">
		<button class="next-button flex-1" on:click={editProfile}>
			<img src={edit} alt="Edit" />
		</button>
	</section>
</section>

<style>
	section {
		max-height: 77vh;
		overflow-y: auto;
	}

	.input-width {
		width: auto;
		max-width: 100%;
	}
	.text-size {
		font-size: 18px;
		margin-top: -5px;
	}
	.text-size1 {
		font-size: 18px;
	}
	.card-header {
		display: flex; /* 啟用 Flexbox */
		justify-content: center; /* 水平居中 */
		align-items: center; /* 垂直居中 */
		margin-bottom: 15px;
	}

	.card {
		margin-left: 25px;
		margin-right: 25px;
		margin-top: 20px;
	}

	.quote-text {
		margin-left: 3px;
		margin-right: 3px;
		margin-top: 10px;
		margin-bottom: 10px;
	}

	.card-quote {
		font-size: 16px; /* Adjust the size as needed */
		color: #dddddd;
		margin-bottom: 24px;
		margin-left: 0px;
		margin-right: 0px;
		margin-top: 10px;
		text-align: center;
		padding: 0 20px; /* Adds padding on both sides */
		/* margin-top: -10%; */
	}

	.next-button {
		width: 60px; /* Adjust the size as needed */
		height: 60px;
		border-radius: 50%; /* Makes the div round */
		background: #fff; /* Background color for the circle */
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.next-button img {
		width: 30px; /* Adjust as needed */
		height: auto;
	}
</style>
