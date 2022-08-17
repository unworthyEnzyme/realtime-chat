import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import useUsername from "../../hooks/useUsername";
import { DB } from "../../store/localForage";

interface Message {
	id: string;
	from: string;
	content: string;
}

interface OutgoingMessage {
	to: string;
	content: string;
}

const PostMessage = ({
	friend,
	setMessages,
	db,
}: {
	friend: string;
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
	db: DB;
}) => {
	const { register, handleSubmit, reset } = useForm<{ content: string }>();

	const onSubmit: SubmitHandler<{ content: string }> = async (data) => {
		const outgoingMessage: OutgoingMessage = {
			to: friend,
			content: data.content,
		};
		const res = await db.sendMessage(outgoingMessage);
		setMessages((currentMessages) => [...currentMessages, res]);
		db.insertMessage(res, friend);
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

const ChatFeed = ({ db }: { db: DB }) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const { friend } = useParams();
	if (friend === undefined) throw new Error(":friend param is not defined");
	const listener = (e: Event) => {
		if (e instanceof CustomEvent) {
			const message = e.detail as Message;
			setMessages((currentMessages) => [...currentMessages, message]);
		}
	};
	useEffect(() => {
		db.addEventListener(`message-from-${friend}`, listener);
		return () => {
			db.removeEventListener(`message-from-${friend}`, listener);
		};
	}, [friend, listener]);

	return (
		<div>
			<div className="flex flex-col w-full min-h-full items-start">
				{messages.map((message: Message) => (
					<ChatMessage message={message} key={message.id} />
				))}
			</div>
			<PostMessage friend={friend} setMessages={setMessages} db={db} />
		</div>
	);
};

export default ChatFeed;
