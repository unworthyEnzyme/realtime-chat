import cookie from "cookie";
import crypto from "crypto";
import { Router } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import prisma from "../prisma";

export const realTimeRouter = Router();

realTimeRouter.get("/ping-user/:username", async (req, res) => {
	//I need this to check if i am able to chat with this user on the client.
	const username = req.params.username;
	const user = await prisma.user.findUnique({
		where: {
			username,
		},
	});
	if (!user) {
		res.sendStatus(404);
		return;
	}
	res.sendStatus(200);
});

interface UserInfo {
	socket: Socket;
	username: string;
}

interface OutgoingMessage {
	id: string;
	from: string;
	content: string;
}

interface IncomingMessage {
	to: string;
	content: string;
}
export class Pusher {
	private io: Server;
	private activeUsers: Map<string, UserInfo>;
	private currentConnectionAttemptUsername: string | null = null;
	constructor(server: http.Server) {
		this.io = new Server(server, {
			cors: {
				origin: "http://localhost:5173",
				credentials: true,
				allowedHeaders: ["Content-Type", "Cookie", "Set-Cookie"],
			},
			allowRequest: async (req, callback) => {
				const sessionCookie = cookie.parse(req.headers.cookie || "");
				const session = await prisma.session.findUnique({
					where: {
						id: sessionCookie.sessionId ?? "",
					},
					include: {
						client: true,
					},
				});
				if (!session) {
					callback("Required Authentication", false);
					return;
				}
				this.currentConnectionAttemptUsername = session.clientUsername;
				callback(null, true);
			},
		});
		this.activeUsers = new Map();
	}
	init() {
		this.io.on("connection", (socket) => {
			this.activeUsers.set(socket.id, {
				socket,
				username: this.currentConnectionAttemptUsername!,
			});
			socket.on("message", async (message: IncomingMessage, callback) => {
				let receivers: UserInfo[] = [];
				for (const activeUser of this.activeUsers.values()) {
					if (activeUser.username === message.to) {
						receivers.push(activeUser);
					}
				}
				const outgoingMessage: OutgoingMessage = {
					id: crypto.randomBytes(16).toString("base64"),
					from: this.activeUsers.get(socket.id)!.username,
					content: message.content,
				};
				if (receivers.length === 0) {
					await prisma.volatileMessage.create({
						data: {
							fromUsername: outgoingMessage.from,
							toUsername: message.to,
							content: message.content,
						},
					});
				}
				for (const receiver of receivers) {
					receiver?.socket.volatile.emit("message", outgoingMessage);
				}
				if (callback) {
					//Because i can't send a callback when testing with postman
					callback(outgoingMessage);
				}
			});
			socket.on("getAllMessages", async (callback) => {
				const latestMessages = await prisma.volatileMessage.findMany({
					where: {
						toUsername: this.activeUsers.get(socket.id)?.username,
					},
					select: {
						id: true,
						fromUsername: true,
						content: true,
					},
				});
				callback(latestMessages);
				await prisma.volatileMessage.deleteMany({
					where: {
						toUsername: this.activeUsers.get(socket.id)?.username,
					},
				});
			});

			socket.on(
				"send-offer",
				async (offer: { to: string; sdp: string }, callback: any) => {
					let receivers: UserInfo[] = [];
					for (const activeUser of this.activeUsers.values()) {
						if (activeUser.username === offer.to) {
							receivers.push(activeUser);
						}
					}
					if (receivers.length === 0) {
						callback({ err: true, msg: "User is down" });
						return;
					}
					const outgoingOffer = {
						from: this.activeUsers.get(socket.id)!.username,
						sdp: offer.sdp,
					};
					for (const receiver of receivers) {
						receiver.socket.emit("offer", outgoingOffer);
					}
					callback({ err: false, msg: "Offer is sent" });
				}
			);

			socket.on(
				"send-answer",
				async (answer: { to: string; sdp: string }, callback) => {
					let receivers: UserInfo[] = [];
					for (const activeUser of this.activeUsers.values()) {
						if (activeUser.username === answer.to) {
							receivers.push(activeUser);
						}
					}
					if (receivers.length === 0) {
						callback({ err: true, msg: "User is down" });
						return;
					}
					const outgoingAnswer = {
						from: this.activeUsers.get(socket.id)!.username,
						sdp: answer.sdp,
					};
					for (const receiver of receivers) {
						receiver.socket.emit("answer", outgoingAnswer);
					}
					callback({ err: false, msg: "Answer is sent" });
				}
			);

			socket.on("disconnect", () => {
				this.activeUsers.delete(socket.id);
			});

			socket.conn.on("close", () => {
				this.activeUsers.delete(socket.id);
			});
		});
	}
}
