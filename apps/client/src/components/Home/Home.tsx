import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

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
		socket?.on("message", (message: Message) => {
			setMessages((messages) => [message, ...messages]);
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
