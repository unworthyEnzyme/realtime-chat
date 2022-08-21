import React, { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import useUsername from "../../hooks/useUsername";
import { DB } from "../../store/DB";

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
		await db.insertMessage(res, friend);
		reset();
	};
	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="w-full flex gap-3 justify-around"
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
		db.getAllChatMessages(friend).then((messages) => setMessages(messages));
	}, [db]);

	useEffect(() => {
		//TODO Don't scroll to the bottom if the user is not at the bottom already.
		window.scrollTo(0, document.body.scrollHeight);
	}, [messages]);

	useEffect(() => {
		db.addEventListener(`message-from-${friend}`, listener);
		return () => {
			db.removeEventListener(`message-from-${friend}`, listener);
		};
	}, [friend, listener]);

	return (
		<div className="min-h-screen flex flex-col">
			<div className="flex flex-col w-full items-start justify-end grow overflow-y-auto">
				{messages.map((message: Message) => (
					<ChatMessage message={message} key={message.id} />
				))}
			</div>
			<div className="w-full sticky bottom-0 p-1 bg-white">
				<PostMessage friend={friend} setMessages={setMessages} db={db} />
			</div>
		</div>
	);
};

const CheckIfChatExists = ({ db }: { db: DB }) => {
	const { friend } = useParams();
	if (friend === undefined) throw new Error(":friend param is not defined");

	const [chatExists, setChatExists] = useState<boolean>();

	useEffect(() => {
		db.checkIfChatExists(friend).then((exists) => setChatExists(exists));
	}, [db]);

	return chatExists === undefined ? (
		<div>Loading...</div>
	) : chatExists ? (
		<ChatFeed db={db} />
	) : (
		<div>Chat does not exist</div>
	);
};

export default CheckIfChatExists;
