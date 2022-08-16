import localforage from "localforage";

interface Message {
	id: string;
	from: string;
	content: string;
}
export const addMessage = async (message: Message) => {
	const currentMessages: Message[] =
		(await localforage.getItem("messages")) ?? [];
	await localforage.setItem("messages", [...currentMessages, message]);
};

export const getMessages = async () => {
	const currentMessages: Message[] =
		(await localforage.getItem("messages")) ?? [];
	return currentMessages;
};

export const invalidateMessages = async (messages: Message[]) => {
	const currentMessages: Message[] =
		(await localforage.getItem("messages")) ?? [];
	await localforage.setItem("messages", [...currentMessages, ...messages]);
};
