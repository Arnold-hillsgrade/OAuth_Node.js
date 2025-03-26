"use client";

import { useAppContext } from "@/app/context";
import { getCookie, isTokenValid } from "@/app/utils/cookies";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Header() {
  const router = useRouter();
  const { user, setUser, setWorkspaces } = useAppContext();

  useEffect(() => {
    const checkToken = async () => {
      const token = getCookie('token');
      if (token) {
        try {
          const valid = await isTokenValid(token);
          if (valid.status === 200) {
            setUser(valid.data.user);
          } else {
            document.cookie = `token=; path=/; max-age=0; secure; samesite=strict`;
            document.cookie = `Authorization=; path=/; max-age=0; secure; samesite=strict`;
            setUser({
              id: "",
              name: "",
              email: "",
              avatar: "",
              role: "user"
            });
            setWorkspaces([]);
            router.push("/");
          }
        } catch (error) {
          console.error('Token verification failed:', error);
        }
      }
    };

    checkToken();
  }, [router]);

  const handleLogout = () => {
    document.cookie = `token=; path=/; max-age=0; secure; samesite=strict`;
    document.cookie = `Authorization=; path=/; max-age=0; secure; samesite=strict`;
    localStorage.removeItem("user");
    localStorage.removeItem("workspace");
    localStorage.removeItem("board");
    setUser({
      id: "",
      name: "",
      email: "",
      avatar: "",
      role: "user"
    });
    setWorkspaces([]);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <span className="text-lg font-semibold">ISO+ Portal</span>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.avatar ? <img src={`${user.avatar}`} alt="" width={100} height={100} /> : user.name && user.name.trim() !== ''
                ? user.name.split(' ').map(n => n[0]).join('')
                : 'N/A'}
            </AvatarFallback>
          </Avatar>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}