import { Route, Routes } from "react-router-dom";
import { DB } from "../../store/localForage";
import ChatFeed from "../ChatFeed/ChatFeed";
const Home = () => {
	const db = new DB();
	db.init();
	return (
		<Routes>
			{/* You should validate this path whether it exists in the indexedDB */}
			<Route path="/chat-with/:friend" element={<ChatFeed db={db} />} />
			<Route path="/chats" element={<div>empty for now</div>} />
		</Routes>
	);
};

export default Home;
