import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export function useIsAuthenticated() {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>();
	const { data, isError, isLoading } = useQuery(["auth", "me"], async () => {
		const res = await axios.get("/api/auth/me");
		return res.data;
	});

	useEffect(() => {
		if (data) {
			setIsAuthenticated(true);
		} else if (isError) {
			setIsAuthenticated(false);
		}
	}, [isLoading]);

	return {
		isAuthenticated,
		isLoading,
		accountInfo: data as { username: string },
	};
}

export const UsernameContext = React.createContext("");

export default function Protected({ children }: { children: JSX.Element }) {
	const { isAuthenticated, accountInfo } = useIsAuthenticated();

	return isAuthenticated ? (
		<UsernameContext.Provider value={accountInfo.username}>
			{children}
		</UsernameContext.Provider>
	) : isAuthenticated === false ? (
		<div>
			<Navigate to="/login" replace={true} />
			Redirecting to signup
		</div>
	) : (
		<div>Loading...</div>
	);
}
