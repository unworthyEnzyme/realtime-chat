import axios from "axios";
import localforage from "localforage";
import { io, Socket } from "socket.io-client";

interface Message {
	id: string;
	from: string;
	content: string;
}

interface OutgoingMessage {
	to: string;
	content: string;
}
export class DB extends EventTarget {
	private socket: Socket;
	constructor() {
		super();
		this.socket = io("ws://localhost:8000", {
			withCredentials: true,
		});
	}
	init() {
		this.socket.on("message", async (message: Message) => {
			const username: string = (await localforage.getItem("username"))!;
			if (username !== message.from) {
				await this.addMessage(message, message.from);
			}
		});
	}
	async addMessage(message: Message, friendName: string) {
		const currentMessages: Message[] =
			(await localforage.getItem(friendName)) ?? [];
		await localforage.setItem(friendName, [...currentMessages, message]);
		const messageEvent = new CustomEvent(`message-from-${friendName}`, {
			detail: message,
		});
		this.dispatchEvent(messageEvent);
	}
	async insertMessage(message: Message, friendName: string) {
		const currentMessages: Message[] =
			(await localforage.getItem(friendName)) ?? [];
		await localforage.setItem(friendName, [...currentMessages, message]);
	}
	sendMessage(message: OutgoingMessage): Promise<Message> {
		return new Promise((resolve, _reject) => {
			this.socket.emit("message", message, (res: Message) => {
				resolve(res);
			});
		});
	}

	async getAllChatsInfo() {
		const chatNames = (await localforage.keys()).filter(
			(key) => key !== "username"
		);
		//TODO: Get the latest messages and return that and the `chatNames` as an object.
		return chatNames;
	}

	async createChat(name: string) {
		try {
			try {
				await axios.get(`/api/real-time/ping-user/${name}`);
			} catch (err) {
				throw new Error("User does not exist");
			}
			if ((await localforage.getItem(name)) !== null) {
				throw new Error("Chat already exists");
			}
			if (name === (await localforage.getItem("username"))) {
				throw new Error("You can't chat with yourself");
			}
			await localforage.setItem(name, []);
		} catch (err) {
			throw err;
		}
	}

	async getAllChatMessages(friendName: string): Promise<Message[]> {
		return (await localforage.getItem(friendName)) ?? [];
	}
}
