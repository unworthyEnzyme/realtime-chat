import { useEffect, useState } from "react";
import type { DB } from "../../store/DB";

const rc = new RTCPeerConnection({
	iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
});

const lc = new RTCPeerConnection({
	iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
});

const VideoChat = ({ db }: { db: DB }) => {
	const [to, setTo] = useState("");
	const [someoneIsCalling, setSomeoneICalling] = useState<{
		from: string;
		sdp: string;
	}>();

	//receiver
	const offerListener = async (offer: { from: string; sdp: string }) => {
		setSomeoneICalling(offer);
	};
	const acceptOffer = async () => {
		rc.onicecandidate = (e) => {
			console.log("[receiver] new ice candidate: ", rc.localDescription);
		};
		let channel: RTCDataChannel | null = null;
		rc.ondatachannel = (e) => {
			channel = e.channel;
			channel.onmessage = (e) => console.log("new message: ", e.data);
			channel.onopen = () => console.log("[receiver] connection opened");
		};
		await rc.setRemoteDescription(JSON.parse(someoneIsCalling!.sdp));
		const answer = await rc.createAnswer();
		await rc.setLocalDescription(answer);
		console.log("[receiver] answer created", answer);
		db.socket.emit(
			"send-answer",
			{ to: someoneIsCalling?.from, sdp: JSON.stringify(answer) },
			(info: any) => {
				console.log(info);
			}
		);
	};

	//caller
	const createOffer = async () => {
		const dc = lc.createDataChannel("channel");
		dc.onmessage = (e) => console.log("Message: ", e.data);
		dc.onopen = () => console.log("connection opened");
		lc.onicecandidate = (e) => {
			console.log("[caller] new ice candidate: ", lc.localDescription);
		};
		const offer = await lc.createOffer();
		await lc.setLocalDescription(offer);
		console.log("[caller] local description is set");
		db.socket.emit(
			"send-offer",
			{ to, sdp: JSON.stringify(offer) },
			(info: { err: boolean; msg: string }) => {
				console.log(info);
			}
		);
	};
	const answerListener = async (answer: { from: string; sdp: string }) => {
		await lc.setRemoteDescription(JSON.parse(answer.sdp));
		console.log(answer);
	};

	useEffect(() => {
		db.socket.on("offer", offerListener);
		db.socket.on("answer", answerListener);
		return () => {
			db.socket.removeListener("offer", offerListener);
			db.socket.removeListener("answer", answerListener);
		};
	}, []);

	return (
		<div className="flex flex-col gap-1">
			<input
				type="text"
				onChange={(e) => setTo(e.target.value)}
				className="border border-black"
				placeholder="Who do you want to call?"
			/>
			<button onClick={createOffer} className="bg-green-400 rounded-full p-1">
				Call
			</button>
			{someoneIsCalling ? (
				<div>
					<div>There is an offer from {someoneIsCalling.from}</div>
					<button
						onClick={acceptOffer}
						className="p-1 bg-black text-white rounded-full"
					>
						Accept
					</button>
				</div>
			) : null}
		</div>
	);
};

export default VideoChat;
