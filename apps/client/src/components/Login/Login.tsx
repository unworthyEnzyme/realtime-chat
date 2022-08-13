import axios from "axios";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";

interface FormValues {
	username: string;
	password: string;
}

const Register = () => {
	const { register, handleSubmit } = useForm<FormValues>();
	const onSubmit: SubmitHandler<FormValues> = async (data) => {
		try {
			const res = await axios.post("/api/auth/login", data);
			console.log(res);
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
