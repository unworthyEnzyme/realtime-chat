import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";

function App() {
	return (
		<Routes>
			<Route path="/register" element={<Register />} />
			<Route path="/login" element={<Login />} />
			<Route
				index
				element={<Home />} /**TODO: navigate to an appropriate page */
			/>
			<Route path="*" element={<div>404</div>} />
		</Routes>
	);
}

export default App;
