import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { AiOutlineMessage } from "react-icons/ai";
import type { DB } from "../../store/DB";

interface IProps {
	db: DB;
	setChats: React.Dispatch<
		React.SetStateAction<{ friendName: string; lastMessage: string }[]>
	>;
}

const delayed = (ms: number, callback: () => void) =>
	new Promise(() => setTimeout(callback, ms));

const CreateChat = ({ db, setChats }: IProps) => {
	const { register, handleSubmit, reset } = useForm<{ name: string }>();
	const [isOpen, setIsOpen] = useState(false);
	const [result, setResult] = useState<{
		variant: "ok" | "err";
		detail?: string;
	}>();
	const clearFormState = () => {
		setResult(undefined);
		reset();
	};
	const onSubmit: SubmitHandler<{ name: string }> = async ({ name }) => {
		try {
			await db.createChat(name);
			console.log("Chat created");
			setChats((currentChats) => [
				{ friendName: name, lastMessage: "" },
				...currentChats,
			]);
			setResult({ variant: "ok", detail: "Chat created" });
			delayed(300, () => {
				clearFormState();
				setIsOpen(false);
			});
		} catch (err) {
			if (err instanceof Error) {
				setResult({ variant: "err", detail: err.message });
			}
		}
	};
	return (
		<Dialog.Root
			open={isOpen}
			onOpenChange={(open) => {
				clearFormState();
				setIsOpen(open);
			}}
		>
			<Dialog.Trigger className="w-12 h-12 fixed bottom-4 right-4 bg-green-500 active:bg-green-600 hover:bg-green-600 rounded-full text-white flex justify-center items-center">
				<AiOutlineMessage className="w-1/2 h-1/2" />
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="bg-black opacity-30 fixed inset-0" />
				<Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
					<form onSubmit={handleSubmit(onSubmit)}>
						<input
							type="text"
							{...register("name")}
							placeholder="Your friend's name"
							className="rounded-md p-2 focus:scale-105 transition-transform ease-in-out outline-none focus:outline outline-1 outline-black outline-offset-1"
						/>
						{result && <p>{result.detail}</p>}
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default CreateChat;
