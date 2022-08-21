import crypto from "crypto";
import { add } from "date-fns";
import prisma from "../prisma";

// TODO: Remove the old sessions.

export const createSession = async (username: string) => {
	// ! Timezone is not correct.
	const expirationDate = add(new Date(), { days: 7 });
	const sessionId = crypto.randomBytes(16).toString("base64");
	const session = await prisma.session.create({
		data: {
			id: sessionId,
			clientUsername: username,
			expiresAt: expirationDate,
		},
	});
	return {
		sessionId,
		expiresAt: session.expiresAt,
	};
};
