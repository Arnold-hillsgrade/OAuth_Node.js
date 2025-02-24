"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { useRouter } from "next/navigation";

export default function XeroIntegration() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="max-w-2xl mx-auto p-6">
          <div className="text-center space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Connect with Xero</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Link your Xero account to automatically sync your accounting data and
              streamline your financial management.
            </p>

            <div className="pt-4">
              <Button size="lg" className="gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Connect to Xero
              </Button>
            </div>

            <div className="pt-8 border-t text-sm text-muted-foreground">
              <p>
                By connecting your Xero account, you agree to share your accounting
                data according to our privacy policy and terms of service.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}