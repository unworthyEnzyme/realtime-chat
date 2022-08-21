import { Route, Routes } from "react-router-dom";
import { DB } from "../../store/DB";
import ChatFeed from "../ChatFeed/ChatFeed";
import Chats from "../Chats/Chats";

const Home = () => {
	const db = new DB();
	db.init();
	return (
		<Routes>
			{/* You should validate this path whether it exists in the indexedDB */}
			<Route path="/chat-with/:friend" element={<ChatFeed db={db} />} />
			<Route path="/chats" element={<Chats db={db} />} />
		</Routes>
	);
};

export default Home;
