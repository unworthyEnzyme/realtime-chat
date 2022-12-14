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
		<div className="flex justify-center items-center h-screen">
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="aspect-square flex flex-col items-start justify-center gap-2 p-6 rounded-md border border-gray-400"
			>
				<input
					type="email"
					placeholder="Your email"
					{...register("email")}
					className="border border-gray-400 rounded-md p-2 focus:scale-105 transition-transform ease-in-out"
				/>
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
					Register
				</button>
			</form>
		</div>
	);
};

export default Register;
