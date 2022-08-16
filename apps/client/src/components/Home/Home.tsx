import { Route, Routes } from "react-router-dom";
import ChatFeed from "../ChatFeed/ChatFeed";

const Home = () => {
	return (
		<Routes>
			{/* You should validate this path whether it exists in the indexedDB */}
			<Route path="/chat-with/:friend" element={<ChatFeed />} />
			<Route path="/chats" element={<div>empty for now</div>} />
		</Routes>
	);
};

export default Home;
