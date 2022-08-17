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
export class LocalStorage extends EventTarget {
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
				this.addMessage(message, message.from);
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
		return new Promise((resolve, reject) => {
			this.socket.emit("message", message, (res: Message) => {
				resolve(res);
			});
		});
	}
}
