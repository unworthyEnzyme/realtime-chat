import argon2 from "argon2";
import express from "express";
import { z } from "zod";
import prisma from "../prisma";
import { createSession } from "./session";

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
	/**
	 * Make this bigger in the production.
	 * If you don't do this then `argon2.verify` will throw because the `plain`
	 * argument is empty.
	 */
	password: z.string().min(1),
});
router.post("/signup", async (req, res) => {
	const [data, parseError] = await safe(() =>
		signupSchema.parseAsync(req.body)
	);
	if (parseError !== null) {
		res.status(400).json({ error: parseError });
		return;
	}
	const hashedPassword = await argon2.hash(data.password, {
		type: argon2.argon2id,
		memoryCost: 2 ** 16,
	});
	const [user, err2] = await safe(() =>
		prisma.user.create({
			data: {
				email: data.email,
				username: data.username,
				password: hashedPassword,
			},
		})
	);
	if (err2 !== null) {
		res.status(400).json({ error: "The user already exists" });
		return;
	}
	const [sessionInfo, sessionError] = await safe(() =>
		createSession(user.username)
	);
	if (sessionError !== null) {
		console.error(sessionError);
	} else {
		const { sessionId, expiresAt } = sessionInfo;
		res.set(
			"Set-Cookie",
			`sessionId=${sessionId}; Expires=${expiresAt.toUTCString()}; HttpOnly; Secure; Path=/`
		);
	}
	res.sendStatus(201);
});

const loginSchema = z.object({
	username: z.string(),
	password: z.string().min(1 /**Make this bigger in the production */),
});
router.post("/login", async (req, res) => {
	const [loginData, parseError] = await safe(() =>
		loginSchema.parseAsync(req.body)
	);
	if (parseError !== null) {
		res.status(400).json({ error: parseError });
		return;
	}
	const [user, internalError] = await safe(() =>
		prisma.user.findUnique({ where: { username: loginData.username } })
	);
	if (internalError !== null) {
		res.sendStatus(500);
		return;
	}
	const [verified, verificationError] = await safe(() =>
		/**
		 * Because the right side of the short circuit is an empty string is empty
		 * it will throw that is why i use the `safe` function.
		 */
		argon2.verify(user?.password || "", loginData.password)
	);
	if (!verified || verificationError !== null) {
		res.status(400).json({ error: "Username or password is incorrect" });
		return;
	}
	const [sessionInfo, sessionError] = await safe(() =>
		/**If the password is verified then the user must exists */
		createSession(user!.username)
	);
	if (sessionError !== null) {
		console.error(sessionError);
	} else {
		const { sessionId, expiresAt } = sessionInfo;
		res.set(
			"Set-Cookie",
			`sessionId=${sessionId}; Expires=${expiresAt.toUTCString()}; HttpOnly; Secure; Path=/`
		);
	}
	res.sendStatus(200);
});

router.get("/me", async (req, res) => {
	const sessionId = req.cookies.sessionId;
	if (sessionId === undefined) {
		res.sendStatus(401);
		return;
	}
	const session = await prisma.session.findUnique({
		where: { id: sessionId },
	});
	if (!session) {
		res.sendStatus(401);
		return;
	}
	res.json({ username: session.clientUsername });
});

export default router;
