<script lang="ts">
	// import edit from '../svg/save.png?url';
	import { initializeApp } from 'firebase/app';
	import { getAuth } from 'firebase/auth';
	import { getDatabase, ref, update, onValue } from 'firebase/database';
	import { firebaseConfig } from '../lib/stores/firebaseConfig.js';
	import { quote, userUid, name, major, tonight, grade, mySex, email } from '$lib/stores/userStore';
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
			$email = data.email;
			// 加載用戶資料
		});
		const userPublicRef = ref(database, 'users/' + userId + '/publicProfile');
		onValue(userPublicRef, (snapshot) => {
			const publicdata = snapshot.val();
			$quote = publicdata.quote || '在這裡設置您的自介';
			$major = publicdata.major;
			$grade = publicdata.grade;
			$mySex = publicdata.mySex;
			$tonight = publicdata.tonight;
			// 加載用戶公共資料
		});
	}

	const editProfile = async () => {
		const userUidValue = $userUid; // 用戶自己的Uid
		const publicProfileData = {
			quote: $quote,
			major: $major,
			grade: $grade,
			mySex: $mySex,
			tonight: $tonight
		};
		try {
			await update(ref(database, 'users/' + userUidValue + '/publicProfile'), publicProfileData);
			alert('修改成功');
		} catch (error) {
			console.error('更新数据时发生错误:', error);
		}
	};
</script>

<section class="w-full flex-1 flex-col items-center space-y-3 px-5">
	<div class="card flex items-center justify-center">
		<header class="card-header flex text-2xl">
			<h1>🥳 歡迎, {$name} 👋🏻</h1>
		</header>
	</div>

	<label class="label w-1/8 h-20 md:w-1/2">
		<span class=" flex items-center pl-2">關於我🤙：</span>
		<input class="input h-10 w-full p-4" type="text" bind:value={$quote} />
	</label>

	<label class="label w-1/8 h-20 md:w-1/2">
		<span class=" flex items-center pl-2">個人ID🪪：</span>
		<input class="input h-10 w-full p-4" type="text" bind:value={$userUid} disabled />
	</label>

	<label class="label w-1/8 h-20 md:w-1/2">
		<span class=" flex items-center pl-2">Email📧：</span>
		<input class="input h-10 w-full p-4" type="text" bind:value={$email} disabled />
	</label>

	<label class="label w-1/8 h-20 md:w-1/2">
		<span class=" flex items-center pl-2">系級🎓：</span>
		<input class="input h-10 w-full p-4" type="text" bind:value={$major} />
	</label>

	<label class="label w-1/8 h-20 md:w-1/2">
		<span class=" flex items-center pl-2">性別♂️|♀️：</span>
		<div class="mysex flex items-center">
			<input type="radio" bind:group={$mySex} value="男" class="mr-2" />
			<span class="mr-4">男♂️</span>
			<input type="radio" bind:group={$mySex} value="女" class="mr-2" />
			<span>女♀️</span>
		</div>
	</label>

	<section class="text-size px-4.5 w-full flex-1 items-center space-y-3">
		<span class=" flex items-center pl-2">我的標籤🏷️：</span>
		<div class="card card-quote flex">
			<div class="quote-text flex">
				<select class="input input-width ml-1 h-10 w-full" bind:value={$grade}>
					<option value="bachelor">大學 🏫</option>
					<option value="master">碩班 🏛️</option>
					<option value="phd">博士 🏟️</option>
				</select>
				<select class="input input-width ml-1 h-10 w-full" bind:value={$tonight}>
					<option value="bad">單身可壞壞 😈</option>
					<option value="couple">死會不缺愛 💔</option>
					<option value="chat">單身可 +賴 💬</option>
				</select>
			</div>
		</div>
	</section>
	<section class="flex-1 flex-h items-center justify-center">
		<button class="btn variant-filled align-center mt-3 w-1/3 justify-center md:w-1/2 mb-5" on:click={editProfile}>
			<!-- <img src={edit} alt="Edit" /> -->
			<span class="text-below-image">儲存✒️</span>
		</button>
	</section>
</section>

<style>
	section {
		overflow-y: auto;
	}

	.input-width {
		width: auto;
		max-width: 100%;
	}

	.mysex {
		margin-left: 10px;
	}

	.text-size {
		font-size: 18px;
		margin-top: -20%;
		margin-bottom: -20px;
	}

	.card-header {
		display: flex; /* 啟用 Flexbox */
		justify-content: center; /* 水平居中 */
		align-items: center; /* 垂直居中 */
		margin-bottom: 8px;
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
</style>
