import axios from "axios";
import localforage from "localforage";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface FormValues {
	username: string;
	password: string;
}

const Register = () => {
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
		<div>
			<form onSubmit={handleSubmit(onSubmit)}>
				<input
					type="text"
					placeholder="Your username"
					{...register("username")}
				/>
				<input
					type="password"
					placeholder="Your password"
					{...register("password")}
				/>
				<button>Login</button>
			</form>
		</div>
	);
};

export default Register;
