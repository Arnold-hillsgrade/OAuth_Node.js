"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import axios from "axios";
import { getCookie, isTokenValid } from "./utils/cookies";
import { useAppContext } from "@/app/context/index";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkToken = async () => {
      const token = getCookie('token');
      if (token) {
        try {
          const valid = await isTokenValid(token);
          if (valid.status === 200) {
            setUser(valid.data.user);
            router.push('/dashboard');
          } else {
            document.cookie = `token=; path=/; max-age=0; secure; samesite=strict`;
            document.cookie = `Authorization=; path=/; max-age=0; secure; samesite=strict`;
            localStorage.removeItem("user");
            localStorage.removeItem("workspace");
            localStorage.removeItem("board");
          }
        } catch (error) {
          console.error('Token verification failed:', error);
        }
      }
    };

    checkToken();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        email,
        password
      });

      if (response.status == 200) {
        document.cookie = `token=${response.data.token}; path=/; max-age=86400; secure; samesite=strict`;
        setUser(response.data.user);
        router.push('/dashboard');
      } else {
        setError("Credential is not correct!");
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError("Login Failed");
    }
  };

  const handleISOPlusLogin = async () => {
    try {
      const redirectUrl = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/isoplus/redirect`, { headers: { 'X-API-Version': '2025-02-26.morava' } });

      if (redirectUrl.status == 200) {
        const width = 600;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        window.open(
          redirectUrl.data.redirect_uri,
          'OAuth2 Login',
          `width=${width},height=${height},left=${left},top=${top},status=yes,scrollbars=yes`
        );

        const handleMessage = async (event: MessageEvent) => {
          if (event.data.type === 'AUTH_SUCCESS') {
            try {
              document.cookie = `Authorization=${event.data.accessToken}; path=/; max-age=86400; secure; samesite=strict`;
              const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/oauth-login`, {
                oauthData: event.data.data
              }, { headers: { Authorization: event.data.accessToken } });

              if (response.status === 200) {
                document.cookie = `token=${response.data.token}; path=/; max-age=86400; secure; samesite=strict`;
                setUser(response.data.user);
                router.push('/dashboard');
              } else {
                throw new Error('Login failed');
              }
            } catch (error) {
              console.error('Login error:', error);
              setError("Login Failed");
            }
          } else if (event.data.type === 'AUTH_ERROR') {
            console.error('Authentication failed:', event.data.error);
            setError(event.data.error);
          }
        };

        window.addEventListener('message', handleMessage);

        return () => {
          window.removeEventListener('message', handleMessage);
        };
      }
    } catch (error) {
      console.error('Redirect URL fetch failed:', error);
      setError("Login Failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue to your workspace</p>
        </div>

        <Tabs defaultValue="isoplus" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="isoplus">ISO+ Login</TabsTrigger>
            <TabsTrigger value="admin">Admin Login</TabsTrigger>
          </TabsList>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <TabsContent value="isoplus">
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Click below to authenticate with ISO+
              </p>
              <Button
                onClick={handleISOPlusLogin}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
                size="lg"
              >
                Continue with ISO+
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="admin">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Login as Admin
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </Card>
    </div>
  );
}