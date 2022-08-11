import axios from "axios";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";

interface FormValues {
	email: string;
	username: string;
	password: string;
}

const Register = () => {
	const { register, handleSubmit } = useForm<FormValues>();
	const onSubmit: SubmitHandler<FormValues> = async (data) => {
		try {
			const res = await axios.post("/api/auth/signup", data);
			console.log(res);
		} catch (err) {
			console.error(err);
		}
	};
	return (
		<div>
			<form onSubmit={handleSubmit(onSubmit)}>
				<input type="email" placeholder="Your email" {...register("email")} />
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
				<button>Register</button>
			</form>
		</div>
	);
};

export default Register;
