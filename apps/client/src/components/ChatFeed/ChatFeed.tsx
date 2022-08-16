import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { io, Socket } from "socket.io-client";
import useUsername from "../../hooks/useUsername";
import {
	addMessage,
	getMessages,
	invalidateMessages,
} from "../../store/localForage";

interface Message {
	id: string;
	from: string;
	content: string;
}

interface OutgoingMessage {
	to: string;
	content: string;
}

const PostMessage = ({ socket }: { socket: Socket | undefined }) => {
	const { register, handleSubmit, reset } = useForm<{ content: string }>();
	const onSubmit: SubmitHandler<{ content: string }> = (data) => {
		const outgoingMessage: OutgoingMessage = {
			to: "memo",
			content: data.content,
		};
		console.log(socket);
		socket?.emit("message", outgoingMessage);
		reset();
	};
	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="w-full flex gap-3 justify-around my-2"
		>
			<input
				type="text"
				placeholder="What do you think?"
				className="bg-gray-200 rounded-full p-2 flex-grow"
				{...register("content")}
			/>
			<button className="bg-black rounded-full p-2 px-4 text-white">
				Send
			</button>
		</form>
	);
};

const ChatMessage = ({ message }: { message: Message }) => {
	const username = useUsername();
	const didIPostThis = message.from === username;
	return (
		<div
			className={`${
				didIPostThis ? "self-end bg-green-500" : "bg-gray-500"
			} text-white px-2 py-1 m-1 rounded-full flex items-center justify-center`}
		>
			<div>{message.content}</div>
		</div>
	);
};

const ChatFeed = () => {
	const [socket, setSocket] = useState<Socket>();
	const [messages, setMessages] = useState<Message[]>([]);

	useEffect(() => {
		const socketInstance = io("ws://localhost:8000", {
			withCredentials: true,
		});
		setSocket(() => socketInstance);
		return () => {
			socketInstance.disconnect();
		};
	}, []);

	useEffect(() => {
		socket?.emit("getAllMessages", async (res: Message[]) => {
			await invalidateMessages(res);
			const freshMessages = await getMessages();
			setMessages(() => freshMessages);
		});
		socket?.on("message", async (message: Message) => {
			await addMessage(message);
			setMessages((messages) => [...messages, message]);
			console.log(message);
		});
	}, [socket]);

	return (
		<div>
			<div className="flex flex-col w-full min-h-full items-start">
				{messages.map((message: Message) => (
					<ChatMessage message={message} key={message.id} />
				))}
			</div>
			<PostMessage socket={socket} />
		</div>
	);
};

export default ChatFeed;
