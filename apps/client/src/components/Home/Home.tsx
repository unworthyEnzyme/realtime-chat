import { useEffect, useLayoutEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { addMessage, getMessages, invalidateMessages } from "../../store/localForage";

interface Message {
	id: string;
	from: string;
	content: string;
}

const Home = () => {
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
			await invalidateMessages(res)
			const freshMessages = await getMessages();
			setMessages((messages) => [...messages, ...freshMessages]);
		})
		socket?.on("message", async (message: Message) => {
			await addMessage(message)
			setMessages((messages) => [...messages, message]);
			console.log(message);
		});
	}, [socket]);

	return (
		<div>
			{messages.map((message: Message) => (
				<div key={message.id}>{message.content}</div>
			))}
		</div>
	);
};

export default Home;
