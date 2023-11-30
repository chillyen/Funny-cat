<script lang="ts">
	import { initializeApp } from 'firebase/app';
	import {
		getAuth,
		signInWithEmailAndPassword,
		createUserWithEmailAndPassword,
		sendEmailVerification,
		type User
	} from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Alert from './Alert.svelte';

	let email = '';
	let password = '';
	let showToast = false;
    

	

	const firebaseConfig = {
		apiKey: 'AIzaSyCixOgrfafDH8yoAmbA4LOhi4x9PFh_3g4',
		authDomain: 'funny-cat-f7c67.firebaseapp.com',
		projectId: 'funny-cat-f7c67',
		storageBucket: 'funny-cat-f7c67.appspot.com',
		messagingSenderId: '99505208443',
		appId: '1:99505208443:web:ff31eabb62b5e5454e36de'
	};

	// 初始化 Firebase
	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);

	const login = async () => {
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			console.log('Logged in as:', email);
            console.log('User UID:', userCredential.user.uid);
			onLoginSuccess(userCredential.user);
            return
		} catch (error) {
			console.error('Login error:', error);
		}
	};

	const register = async () => {
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			console.log('User created:', userCredential.user);
			sendVerificationEmail(userCredential.user);
            verifyemail();
		} catch (error) {
			console.error('Registration error:', error);
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

	const onLoginSuccess = (user: User) => {
		if (!user.emailVerified) {
            verifyemail();
		} else {
			goto('/')
		}
	};

	const verifyemail = () => {
		showToast = true;
		console.log('Please verify your email. Check your inbox for the verification email.');
	};
	
</script>
<Alert showToast />
<div
	class="container mx-auto flex h-full flex-col items-center justify-center"
	on:submit|preventDefault={login}
>
	<label class="label w-3/4 md:w-1/2">
		<input
			class="input h-10 w-full p-4"
			type="text"
			bind:value={email}
			placeholder="政大電子郵件"
		/>
		<input class="input h-10 w-full p-4" type="password" bind:value={password} placeholder="密碼" />
	</label>
	<button
		class="btn variant-filled align-center mt-3.5 w-3/4 justify-center md:w-1/2"
		type="submit"
		on:click={login}>登錄</button
	>
	<button
		class="btn variant-filled align-center mt-1 w-3/4 justify-center md:w-1/2"
		type="button"
		on:click={register}>首次註冊</button
	> 
</div>
