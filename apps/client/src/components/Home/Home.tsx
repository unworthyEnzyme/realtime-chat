import { Route, Routes } from "react-router-dom";
import { LocalStorage } from "../../store/localForage";
import ChatFeed from "../ChatFeed/ChatFeed";
const Home = () => {
	const localStorage = new LocalStorage();
	localStorage.init();
	return (
		<Routes>
			{/* You should validate this path whether it exists in the indexedDB */}
			<Route
				path="/chat-with/:friend"
				element={<ChatFeed localStorage={localStorage} />}
			/>
			<Route path="/chats" element={<div>empty for now</div>} />
		</Routes>
	);
};

export default Home;
