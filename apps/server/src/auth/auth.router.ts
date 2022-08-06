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

const loginSchema = z.object({
	username: z.string(),
	password: z.string(),
});
router.post("/login", async (req, res) => {
	const [loginData, err] = await safe(() => loginSchema.parseAsync(req.body));
	if (err !== null) {
		res.status(400).json({ error: "Invalid schema" });
		return;
	}
	const [user, err2] = await safe(() =>
		prisma.user.findUnique({ where: { username: loginData.username } })
	);
	if (err2 !== null) {
		res.sendStatus(500);
		return;
	}
	if (user === null) {
		//TODO: Don't give away so much info.
		res.status(400).json({ error: "User not found" });
		return;
	}
	if (user.password !== loginData.password) {
		//TODO: Don't give away so much info.
		res.status(400).json({ error: "Wrong password" });
		return;
	}
	res.json({ data: "You are logged in." });
});

export default router;
