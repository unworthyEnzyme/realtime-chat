import localforage from "localforage";

interface Message {
	id: string;
	from: string;
	content: string;
}
export const addMessage = async (message: Message, friendName: string) => {
	const currentMessages: Message[] =
		(await localforage.getItem(friendName)) ?? [];
	await localforage.setItem(friendName, [...currentMessages, message]);
};

export const getMessages = async (friendName: string) => {
	const currentMessages: Message[] =
		(await localforage.getItem(friendName)) ?? [];
	return currentMessages;
};

export const invalidateMessages = async (
	messages: Message[],
	friendName: string
) => {
	const currentMessages: Message[] =
		(await localforage.getItem(friendName)) ?? [];
	await localforage.setItem(friendName, [...currentMessages, ...messages]);
};

export const createChat = async (friendName: string) => {
	await localforage.setItem(friendName, []);
};
