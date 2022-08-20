import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DB } from "../../store/localForage";
import CreateChat from "../CreateChat/CreateChat";

const Chats = ({ db }: { db: DB }) => {
	const [chats, setChats] = useState<string[]>([]);
	useEffect(() => {
		db.getAllChatsInfo()
			.then((chat) => setChats(chat))
			.catch((err) => console.log(err));
	}, [db]);
	return (
		<div>
			{chats.map((chat) => (
				<Link key={chat} to={`/app/chat-with/${chat}`} className="block">
					{chat}
				</Link>
			))}
			<CreateChat db={db} setChats={setChats} />
		</div>
	);
};

export default Chats;
