import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { DB } from "../../store/localForage";

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
			<Dialog.Trigger>+</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="bg-black opacity-30 fixed inset-0" />
				<Dialog.Content className="bg-white fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
					<form onSubmit={handleSubmit(onSubmit)}>
						<input type="text" {...register("name")} />
						{result && <p>{result.detail}</p>}
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default CreateChat;
