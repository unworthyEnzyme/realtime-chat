import axios from "axios";
import localforage from "localforage";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface FormValues {
	username: string;
	password: string;
}

const Login = () => {
	const { register, handleSubmit } = useForm<FormValues>();
	const navigate = useNavigate();
	const onSubmit: SubmitHandler<FormValues> = async (data) => {
		try {
			await axios.post("/api/auth/login", data);
			await localforage.setItem("username", data.username);
			navigate("/app/chats");
		} catch (err) {
			console.error(err);
		}
	};
	return (
		<div className="flex justify-center items-center h-screen">
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="aspect-square flex flex-col items-start justify-center gap-2 p-6 rounded-md border border-gray-400"
			>
				<input
					type="text"
					placeholder="Your username"
					{...register("username")}
					className="border border-gray-400 rounded-md p-2 focus:scale-105 transition-transform ease-in-out"
				/>
				<input
					type="password"
					placeholder="Your password"
					{...register("password")}
					className="border border-gray-400 rounded-md p-2 focus:scale-105 transition-transform ease-in-out"
				/>
				<button className="rounded-full py-2 px-4 text-white bg-green-500 self-start focus:scale-105 transition-transform ease-in-out">
					Login
				</button>
			</form>
		</div>
	);
};

export default Login;
