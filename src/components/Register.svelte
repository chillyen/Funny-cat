<script lang="ts">
	import { initializeApp } from 'firebase/app';
	import {
		getAuth,
		createUserWithEmailAndPassword,
		sendEmailVerification,
		type User
	} from 'firebase/auth';

	import { firebaseConfig } from '../lib/stores/firebaseConfig.js';
	import { goto } from '$app/navigation';
	import { nickname, major } from '$lib/stores/userStore.js';
	import goBackIcon from '../svg/goback.jpg?url';

	let email = '';
	let number = '';
	let password = '';
	let passwordcorrect = '';
	let showToast = false;
	let isPasswordIn = false;
	let accountExists = false;

	// 初始化 Firebase
	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);

	const goBack = () => {
		goto('/');
	};
	const register = async () => {
		if (password !== passwordcorrect) {
			isPasswordIn = true; // 显示密码错误信息
			return; // 不继续执行注册逻辑
		}
		isPasswordIn = false;
		email = number + '@nccu.edu.tw';
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			sendVerificationEmail(userCredential.user);
			goto('/');
		} catch (error) {
			if (error instanceof Error && 'code' in error) {
				console.error('Registration error:', error);
				if (error.code === 'auth/email-already-in-use') {
					accountExists = true;
				}
			} else {
				console.error('Unexpected error:', error);
			}
		}
	};

	const sendVerificationEmail = (user: User) => {
		sendEmailVerification(user)
			.then(() => {
				console.log('Verification email sent.');
				showToast = true;
			})
			.catch((error) => {
				console.error('Error sending verification email:', error);
			});
	};
</script>

<button class="back-button" on:click={goBack}>
	<img src={goBackIcon} class="back-btn" alt="Back" />
</button>
<div
	class="container mx-auto flex h-full flex-col items-center justify-center"
	on:submit|preventDefault={register}
>
	<label class="label w-3/4 md:w-1/2">
		<span class="mt-3 flex items-center pl-2">匿名名稱：</span>
		<input class="input h-10 w-full p-5" type="text" bind:value={$nickname} />
		<span class="mt-3 flex items-center pl-2">政大學號：</span>
		<input class="input h-10 w-full p-5" type="text" bind:value={number} />
		<span class="mt-3 flex items-center pl-2">政大系級：</span>
		<input class="input h-10 w-full p-5" type="text" bind:value={$major} />
		<span class="mt-3 flex items-center pl-2">密碼設置：</span>
		<input class="input h-10 w-full p-5" type="password" bind:value={password} />
		<span class="mt-3 flex items-center pl-2">密碼確認：</span>
		<input class="input h-10 w-full p-5" type="password" bind:value={passwordcorrect} />
	</label>
	<button
		class="btn variant-filled align-center mt-5 w-3/4 justify-center md:w-1/3"
		type="button"
		on:click={register}>註冊</button
	>
	{#if isPasswordIn}
		<div class="mt-2 flex items-center pl-2 text-red-500">密碼輸入不相同</div>
	{/if}
	{#if accountExists}
		<div class="mt-2 flex items-center pl-2 text-red-500">此帳號已經建立過</div>
	{/if}
</div>

<style>
	.back-button {
		width: 45px;
		height: 45px;
        margin: 3%;
	}
	.back-btn {
		border-radius: 50%;
	}
</style>
