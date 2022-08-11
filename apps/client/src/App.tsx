import { Route, Routes } from "react-router-dom";
import "./App.css";
import Register from "./components/Register/Register";

function App() {
	return (
		<Routes>
			<Route path="/register" element={<Register />} />
			<Route
				index
				element={<div>404</div>} /**TODO: navigate to an appropriate page */
			/>
		</Routes>
	);
}

export default App;
