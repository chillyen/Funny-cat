<script lang="ts">
	import type { Message, PageData, Profile } from '../types/types';
	import { joinRoom, selfId } from 'trystero';
	import { afterUpdate } from 'svelte';
	import MessageFeed from './MessageFeed.svelte';
	import MessagePrompt from './MessagePrompt.svelte';
	import {
		nickname,
		roomID,
		otherLeave,
		peerList,
		joinVoiceChat,
		exitVoiceChat,
		micOn
	} from '$lib/stores/userStore';
	import { page } from '$app/stores';

	// export let data: PageData;
	// export let toggleChatInterface: () => void = () => {};
	export let messageScrollNode: HTMLElement;

	let showChatInterface: boolean = $nickname !== '';
	let messages: Message[] = [];

	$roomID = $page.url.pathname;

	console.log('chat begins');

	const config = { appId: 'FunnyCat-rooms' };
	let room = joinRoom(config, $roomID);

	const [sendProfile, getProfile] = room.makeAction('profile');
	const [sendMessage, getMessage] = room.makeAction('message');

	// let peerList: Profile[] = [];

	let selfJoined = false;
	let peerCount = 0;

	const profile: Profile = {
		id: selfId,
		name: $nickname,
		joined: Date.now()
	};

	room.onPeerJoin((peerId) => {
		if (peerCount < 2) {
			sendProfile(profile, peerId);
			selfJoined = true;
			peerCount++;
		} else {
			sendMessage({ type: 'room-full', content: 'This room is full.' });
			room.leave();
			console.log('more than two people');
		}
	});

	room.onPeerLeave((peerId) => {
		let leaver = $peerList.find((peer) => peer.id === peerId);
		const date = new Date();
		let newMessage: Message = {
			type: 'status-left',
			id: date.toISOString(),
			sender: $nickname,
			content: `${leaver?.name} left the room`,
			timestamp: `${date.toTimeString().slice(0, 8)}`
		};
		pushMessageToMessageLog(newMessage);
		$peerList = $peerList.filter((peer) => peer.id != leaver?.id);
		selfJoined = false;

		if ($peerList.length <= 1) {
			room.leave();
		}
	});

	getMessage((data, peerId) => {
		let recievedMessage = data as Message;
		messages = [...messages, recievedMessage];
	});

	getProfile((data, peerId) => {
		let otherProfile = data as Profile;
		// $peerList = [...$peerList, otherProfile];
		$peerList.push(otherProfile);
		$peerList = $peerList;

		const date = new Date();
		let newMessage: Message = {
			type: 'status-joined',
			id: date.toISOString(),
			sender: otherProfile.name,
			content: `${otherProfile.name} joined the room`,
			timestamp: `${date.toTimeString().slice(0, 8)}`
		};
		let newMessage1: Message = {
			type: 'status-joined',
			id: date.toISOString(),
			sender: profile.name,
			content: `${profile.name} joined the room`,
			timestamp: `${date.toTimeString().slice(0, 8)}`
		};
		pushMessageToMessageLog(newMessage);
		pushMessageToMessageLog(newMessage1);
	});

	const pushMessageToMessageLog = (newMessage: Message) => {
		messages = [...messages, newMessage];
	};

	afterUpdate(() => {
		if (messages)
			messageScrollNode.scroll({ top: messageScrollNode.scrollHeight, behavior: 'smooth' });
	});

	const peerAudios: any = {};

	// get a local audio stream from the microphone
	let selfStream: MediaStream;

	$exitVoiceChat = async () => {
		room.removeStream(selfStream as MediaStream);
		selfStream.getTracks().forEach(function (track) {
			track.stop();
		});
	};

	$joinVoiceChat = async () => {
		// this object can store audio instances for later

		selfStream = await navigator.mediaDevices.getUserMedia({
			audio: true,
			video: false
		});

		// send stream to peers currently in the room
		room.addStream(selfStream);

		// send stream to peers who join later
		room.onPeerJoin(async (peerId) => $micOn && room.addStream(selfStream as MediaStream, peerId));
	};

	// handle streams from other peers
	room.onPeerStream((stream, peerId) => {
		// create an audio instance and set the incoming stream
		const audio = new Audio();
		audio.srcObject = stream;
		audio.autoplay = true;

		// add the audio to peerAudio object if you want to address it for something
		// later (volume, etc.)
		peerAudios[peerId] = audio;
		console.log(peerAudios);
	});
</script>

<div
	bind:this={messageScrollNode}
	class="bg-surface-500/30 flex-1 overflow-y-scroll px-1 py-2 md:px-4 md:py-4"
>
	<MessageFeed {messages} />
</div>

<MessagePrompt sendMessageAction={sendMessage} {pushMessageToMessageLog} />
