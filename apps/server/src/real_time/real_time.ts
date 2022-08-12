import cookie from "cookie";
import http from "http";
import { Server, Socket } from "socket.io";
import prisma from "../prisma";

interface UserInfo {
	socket: Socket;
	username: string;
}

interface Message {
	from: string;
	to: string;
	content: string;
}

export class Pusher {
	private io: Server;
	private activeUsers: Map<string, UserInfo>;
	private currentConnectionAttemptUsername: string | null = null;
	constructor(server: http.Server) {
		this.io = new Server(server, {
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
			socket.on("message", async (message: string) => {
				let receiver: UserInfo | null = null;
				const parsedMessage = JSON.parse(message);
				for (const activeUser of this.activeUsers.values()) {
					if (activeUser.username === parsedMessage.to) {
						console.log(activeUser.username);
						receiver = activeUser;
						break;
					}
				}
				parsedMessage.from = this.activeUsers.get(socket.id)?.username;
				receiver?.socket.emit("message", parsedMessage);
			});
			socket.on("disconnect", (reason) => {
				this.activeUsers.delete(socket.id);
			});
		});
	}
}
