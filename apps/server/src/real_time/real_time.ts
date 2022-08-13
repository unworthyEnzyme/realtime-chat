import cookie from "cookie";
import crypto from "crypto";
import http from "http";
import { Server, Socket } from "socket.io";
import prisma from "../prisma";

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
			socket.on("message", async (message: IncomingMessage) => {
				let receiver: UserInfo | null = null;
				for (const activeUser of this.activeUsers.values()) {
					if (activeUser.username === message.to) {
						receiver = activeUser;
						break;
					}
				}
				const outgoingMessage: OutgoingMessage = {
					id: crypto.randomBytes(16).toString("base64"),
					from: this.activeUsers.get(socket.id)!.username,
					content: message.content,
				};
				receiver?.socket.emit("message", outgoingMessage);
			});
			socket.on("disconnect", (reason) => {
				this.activeUsers.delete(socket.id);
			});
		});
	}
}
