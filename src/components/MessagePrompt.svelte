<script lang="ts">
	import type { Message } from '../types/types';
	import { leaveMode, nickname, roomDeleted } from '$lib/stores/userStore';
	import sendIconUrl from '../svg/send-svgrepo-com.svg?url';
	import ExitIconUrl from '../svg/exit.png';
	import type { ActionSender } from 'trystero';

	export let sendMessageAction: ActionSender<unknown>;
	export let pushMessageToMessageLog: (newMessage: Message) => void;

	let currentMessage: string = '';
	let textAreaRef: HTMLElement;
	let isComposing = false;

	const sendMessage = () => {
		if (currentMessage != '') {
			const date = new Date();
			let newMessage: Message = {
				type: 'message',
				id: date.toISOString(),
				sender: $nickname,
				content: currentMessage,
				timestamp: `${date.toTimeString().slice(0, 8)}`
			};
			sendMessageAction(newMessage);
			pushMessageToMessageLog(newMessage);
			currentMessage = '';
			textAreaRef.focus();
		}
	};

	const onButtonClick = () => {
		//離開聊天室
		$roomDeleted = true;
		$leaveMode = true;
	};
	// const handleFileUpload = (event: Event) => {
	// 	const input = event.target as HTMLInputElement;
	// 	if (input.files && input.files[0]) {
	// 		const file = input.files[0];

	// 		// 在这里处理文件上传逻辑
	// 		console.log('Uploading file:', file.name);

	// 		// 例如，您可以添加代码将文件发送到服务器
	// 	}
	// };

	const onPromptKeydown = (event: KeyboardEvent): void => {
		if (['Enter'].includes(event.code) && !isComposing) {
			event.preventDefault();
			sendMessage();
		}
	};
</script>

<div class="border-grey bg-surface-500/30 row flex border-t p-4">
	{#if $roomDeleted}
		<button class="variant-filled-primary btn_leave w-12" on:click={onButtonClick} disabled>
			<img src={ExitIconUrl} class="photo w-8" alt="Send" />
		</button>
		<div class="input-group-divider input-group rounded-container-token grid-cols-[1fr_auto]">
			<textarea
				class="resize-none border-0 bg-transparent p-3 pl-6 ring-0"
				name="prompt"
				id="prompt"
				placeholder="All destroyed in rooms!"
				rows="1"
				disabled
			/>
			<button class="variant-filled-primary w-14" disabled>
				<img src={sendIconUrl} class="w-10" alt="Send" />
			</button>
		</div>
	{/if}

	{#if !$roomDeleted}
		<button class="variant-filled-primary btn_leave w-12" on:click={onButtonClick}>
			<img src={ExitIconUrl} class="photo w-8" alt="Send" />
		</button>
		<div class="input-group-divider input-group rounded-container-token grid-cols-[1fr_auto]">
			<textarea
				bind:this={textAreaRef}
				bind:value={currentMessage}
				on:keydown={onPromptKeydown}
				on:compositionstart={() => (isComposing = true)}
				on:compositionend={() => (isComposing = false)}
				class="resize-none border-0 bg-transparent p-3 pl-6 ring-0"
				name="prompt"
				id="prompt"
				placeholder="Say something..."
				rows="1"
			/>
			<button class="variant-filled-primary w-14" on:click={sendMessage}>
				<img src={sendIconUrl} class="w-10" alt="Send" />
			</button>
		</div>
	{/if}
</div>

<style>
	.btn_leave {
		height: 40px;
		width: 40px;
		border-radius: 50px;
		margin-right: 7px;
		margin-left: -7px;
		margin-top: 6px;
	}
	.photo {
		margin-left: 5px;
		height: 25px;
		width: 25px;
	}
</style>
