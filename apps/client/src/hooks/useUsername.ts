import { useContext } from "react";
import { UsernameContext } from "../components/Protected/Protected";

const useUsername = () => {
	const username = useContext(UsernameContext);
	return username;
};

export default useUsername;
