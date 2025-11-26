"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);

            const res = await fetch("http://localhost:8002/api/auth/token", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                login(data.access_token, username);
                router.push("/dashboard");
            } else {
                setError("Invalid username or password");
            }
        } catch (err) {
            setError("Something went wrong");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md space-y-8 p-8 rounded-xl border bg-card shadow">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Sign in</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Access your personalized dashboard
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <input
                                type="text"
                                required
                                className="relative block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="relative block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        Sign in
                    </button>
                </form>
                <div className="text-center text-sm">
                    <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
                        Don't have an account? Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
