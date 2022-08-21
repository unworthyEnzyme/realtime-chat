import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DB } from "../../store/DB";
import CreateChat from "../CreateChat/CreateChat";

const Chats = ({ db }: { db: DB }) => {
	const [chats, setChats] = useState<
		{ friendName: string; lastMessage: string }[]
	>([]);
	useEffect(() => {
		db.getAllChatsInfo()
			.then((chat) => setChats(chat))
			.catch((err) => console.log(err));
	}, [db]);
	return (
		<div>
			{chats.map((chat) => (
				<Link
					key={chat.friendName}
					to={`/app/chat-with/${chat.friendName}`}
					className="block border border-gray-300 rounded-md p-2 m-1 hover:bg-gray-200"
				>
					<div className="font-bold">{chat.friendName}</div>
					<div className="text-gray-500 truncate">{chat.lastMessage}</div>
				</Link>
			))}
			<CreateChat db={db} setChats={setChats} />
		</div>
	);
};

export default Chats;
