<script lang="ts">
	import { initializeApp } from 'firebase/app';
	import {
		getAuth,
		signInWithEmailAndPassword,
		sendEmailVerification,
		type User
	} from 'firebase/auth';
	import { getDatabase, ref, update, set, onDisconnect, onValue } from 'firebase/database';
	import { userUid} from '$lib/stores/userStore';
	import { firebaseConfig } from '../lib/stores/firebaseConfig.js';
	import { goto } from '$app/navigation';
	// import Register from '../components/Register.svelte';
	
	let email = '';
	let number = '';
	let password = '';
	let showToast = false;
	let isUserLoggedIn = false;
	let isEmailVerified = false;
	let isRegister = false;

	// 初始化 Firebase
	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);
	const database = getDatabase(app);

	// const isValidNccuEmail = (email: string): boolean => {
	// 	return email.endsWith('@nccu.edu.tw');
	// };

	const login = async () => {
		// email = number + '@nccu.edu.tw';
		// if (!isValidNccuEmail(email)) {
		// 	console.error('Please use a valid NCCU email address.');
		// 	return;
		// }
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			console.log('Logged in as:', email);
			console.log('User UID:', userCredential.user.uid);
			onLoginSuccess(userCredential.user);
			$userUid = userCredential.user.uid;
		} catch (error) {
			console.error('Login error:', error);
			alert('學號或密碼錯誤');
			email='';
			password='';
		}
	};

	const register = async () => {
		isRegister = true;
		goto("/register")
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

	const onLoginSuccess = (user: User) => {
		if (!user.emailVerified) {
			verifyemail();
		} else {
			const userStatusRef = ref(database, 'users/' + user.uid);
			update(userStatusRef, { online: true });
			// onValue(userStatusRef, (snapshot) => {
			// 	const mystatus = snapshot.val();
			// 	console.log('Online users:', mystatus);
			// 	// 處理在線用戶數據...
			// });
			// 設置當用戶斷開連接時自動更新狀態
			onDisconnect(userStatusRef).update({ online: false });
			isUserLoggedIn = true;
			isEmailVerified = true;
			if(isUserLoggedIn && isEmailVerified){
				goto("/home");
			}
			else{
				goto('/')
			}
		}
	};

	const verifyemail = () => {
		showToast = true;
		alert('請驗證您的電子郵件!');
	};
</script>
	<section
		class="container mx-auto flex h-full flex-col items-center justify-center"
		on:submit|preventDefault={login}
	>
		<span class="mb-2 flex items-center text-2xl">歡迎回來👋</span>
		<label class="label w-3/4 md:w-1/2">
			<input class="input h-10 w-full p-3" type="text" bind:value={email} placeholder="政大學號" />
			<span class="flex items-center pl-2">@nccu.edu.tw</span>
			<input
				class="input h-10 w-full p-3"
				type="password"
				bind:value={password}
				placeholder="密碼"
			/>
		</label>
		<button
			class="btn variant-filled align-center mt-3 w-3/4 justify-center md:w-1/2"
			type="submit"
			on:click={login}>登入💓</button
		>
		<button
			class=" align-center mt-2 w-3/4 justify-center md:w-1/2"
			type="button"
			on:click={register}>首次註冊📧</button
		>
	</section>

	<style>
		section {
			overflow-y: auto;
		}
	</style>