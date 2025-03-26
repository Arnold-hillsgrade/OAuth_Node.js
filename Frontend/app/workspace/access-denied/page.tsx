"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";

export default function AccessDenied() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center p-4 flex-1 h-[calc(100vh-4rem)]">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center">
              <Ban className="h-10 w-10 text-destructive" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this resource. Please contact your administrator
            if you believe this is a mistake.
          </p>
          
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    </div>
  );
}