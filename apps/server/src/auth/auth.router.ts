import argon2 from "argon2";
import express from "express";
import { z } from "zod";
import prisma from "../prisma";
import { createSession } from "./session";

type Ok<T> = {
	variant: "ok";
	payload: T;
};
type Err<E = Error> = {
	variant: "err";
	payload: E;
};
type Result<T, E> = Ok<T> | Err<E>;

// type Result<T, E extends Error = Error> = [T, null] | [null, E];
const safe = async <T, E = Error>(
	callback: () => Promise<T>
): Promise<Result<T, E>> => {
	try {
		return {
			variant: "ok",
			payload: await callback(),
		};
	} catch (err) {
		return {
			variant: "err",
			payload: err as E,
		};
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
	const parseResult = await safe(() => signupSchema.parseAsync(req.body));
	if (parseResult.variant !== "ok") {
		res.status(400).json({ error: parseResult.payload });
		return;
	}
	const data = parseResult.payload;
	const hashedPassword = await argon2.hash(data.password, {
		type: argon2.argon2id,
		memoryCost: 2 ** 16,
	});
	const userQueryResult = await safe(() =>
		prisma.user.create({
			data: {
				email: data.email,
				username: data.username,
				password: hashedPassword,
			},
		})
	);
	if (userQueryResult.variant !== "ok") {
		res.status(400).json({ error: "The user already exists" });
		return;
	}
	const user = userQueryResult.payload;
	const sessionCreationResult = await safe(() => createSession(user.username));
	if (sessionCreationResult.variant !== "ok") {
		console.error(sessionCreationResult.payload);
	} else {
		const { sessionId, expiresAt } = sessionCreationResult.payload;
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
	const parseResult = await safe(() => loginSchema.parseAsync(req.body));
	if (parseResult.variant !== "ok") {
		res.status(400).json({ error: parseResult.payload });
		return;
	}
	const loginData = parseResult.payload;
	const user = await prisma.user.findUnique({
		where: { username: loginData.username },
	});
	const hashVerificationResult = await safe(() =>
		/**
		 * Because the right side of the nullish coalescing is an empty string is empty
		 * it will throw that is why i use the `safe` function.
		 */
		argon2.verify(user?.password ?? "", loginData.password)
	);
	const verified = hashVerificationResult.payload;
	if (!verified || hashVerificationResult.variant !== "ok") {
		res.status(400).json({ error: "Username or password is incorrect" });
		return;
	}
	const sessionCreationResult = await safe(() =>
		/**If the password is verified then the user must exists */
		createSession(user!.username)
	);
	if (sessionCreationResult.variant !== "ok") {
		console.error(sessionCreationResult.payload);
	} else {
		const { sessionId, expiresAt } = sessionCreationResult.payload;
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
