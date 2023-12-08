<script lang="ts">
	import wallpaper from '../svg/Gojou sensei.jpg?url';
	import edit from '../svg/edit.svg?url';
	import { quote, userUid } from '$lib/stores/userStore';
</script>

<div class="profile-container mx-auto flex h-full items-center justify-center">
	<div class="avatar-container flex h-full flex-col">
		<div class="welcome-text">WELCOME, LISA</div>
		<div class="quote">
			Hair style is the final tip off whether or not a woman really knows herself.
		</div>
		<button class="next-button ">
			<!-- Icon image or use a font icon library like Font Awesome -->
			<img src={edit} alt="Next" />
		</button>
	</div>
</div>

<style>
	.avatar-container {
		width: 100%; /* Or set a specific width */
		height: 100%; /* Or set a specific height */
		border-bottom-left-radius: 40px;
		border-bottom-right-radius: 40px;
		background-size: cover;
		background-position: center;
		display: flex;
		align-items: center;
		justify-content: center;
		background-image: url("https://i.pinimg.com/originals/45/43/ec/4543ec95f9cc6741aa2613d084bd3c71.jpg");
	}

	.welcome-text {
		align-items: center;
		justify-content: center;
		font-size: 24px; /* Adjust the size as needed */
		font-weight: bold;
		margin-bottom: 25px;
		color: #ffffff;
	}

	.quote {
		font-size: 16px; /* Adjust the size as needed */
		color: #dddddd;
		margin-bottom: 24px;
		text-align: center;
		padding: 0 20px; /* Adds padding on both sides */
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
