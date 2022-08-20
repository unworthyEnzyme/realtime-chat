import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Protected from "./components/Protected/Protected";
import Register from "./components/Register/Register";

function App() {
	return (
		<Routes>
			<Route path="/register" element={<Register />} />
			<Route path="/login" element={<Login />} />
			<Route
				path="/app/*"
				element={
					<Protected>
						<Home />
					</Protected>
				}
			/>
			<Route path="*" element={<div>404</div>} />
		</Routes>
	);
}

export default App;
