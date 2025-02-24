"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import axios from "axios";
import { getCookie, isTokenValid } from './utils/cookies';
import { useDispatch } from 'react-redux';
import { setUser } from './store/slices/userSlice';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const checkToken = async () => {
      const token = getCookie('token');
      if (token) {
        try {
          const valid = await isTokenValid(token);
          if (valid) {
            router.push('/dashboard');
          } else {
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          }
        } catch (error) {
          console.error('Token verification failed:', error);
        }
      }
    };

    checkToken();
  }, [router]);

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
        dispatch(setUser({ user: response.data.user, token: response.data.token }));
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
    const redirectUrl = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/isoplus/redirect`);

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

      window.addEventListener('message', async (event) => {
        if (event.data.type === 'AUTH_SUCCESS') {
          try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/oauth-login`, {
              oauthData: event.data.data
            });

            if (response.status === 200) {
              const { token, user } = response.data;
              document.cookie = `token=${response.data.token}; path=/; max-age=86400; secure; samesite=strict`;
              dispatch(setUser({ user, token }));
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
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome Back</h1>

        <Tabs defaultValue="isoplus" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="isoplus">ISO+ Login</TabsTrigger>
            <TabsTrigger value="admin">Admin Login</TabsTrigger>
          </TabsList>

          <TabsContent value="isoplus">
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Click below to authenticate with ISO+
              </p>
              <Button
                onClick={handleISOPlusLogin}
                className="w-full"
                variant="outline"
              >
                Continue with ISO+
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="admin">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {error && (
                <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {error}
                </div>
              )}
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
              <Button type="submit" className="w-full">
                Login as Admin
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}