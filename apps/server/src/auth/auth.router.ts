import express from "express";
import { z } from "zod";
import prisma from "../prisma";

type Result<T, E extends Error = Error> = [T, null] | [null, E];
const safe = async <T>(callback: () => Promise<T>): Promise<Result<T>> => {
	try {
		return [await callback(), null];
	} catch (err) {
		return [null, err as Error];
	}
};

const router = express.Router();

const signupSchema = z.object({
	username: z.string(),
	email: z.string().email(),
	password: z.string(),
});
router.post("/signup", async (req, res) => {
	const [data, err] = await safe(() => signupSchema.parseAsync(req.body));
	if (err !== null) {
		res.status(400).json({ error: "Invalid schema" });
		return;
	}
	const [user, err2] = await safe(() => prisma.user.create({ data }));
	if (err2 !== null) {
		res.status(400).json({ error: "The user already exists" });
		return;
	}
	res.json({ id: user.id });
});

export default router;
