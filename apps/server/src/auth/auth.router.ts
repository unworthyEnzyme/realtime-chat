import express from "express";
import { z } from "zod";
import prisma from "../prisma";

const router = express.Router();

const signupSchema = z.object({
	username: z.string(),
	email: z.string().email(),
	password: z.string(),
});
router.post("/signup", async (req, res) => {
	const data = signupSchema.parse(req.body);
	const user = await prisma.user.create({ data });
	res.json({ id: user.id });
});

export default router;
