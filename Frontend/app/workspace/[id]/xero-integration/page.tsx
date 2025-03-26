"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ExternalLink, FileSpreadsheet, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function XeroIntegrationPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workspace
        </Button>

        <Card className="max-w-2xl mx-auto p-6">
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Connect with Xero</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Link your Xero account to automatically sync your accounting data and
                streamline your financial management.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <KeyRound className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium">Need Xero API Credentials?</p>
                  <p className="text-sm text-muted-foreground">
                    Follow Xero's guide to create your application and obtain the required credentials.
                  </p>
                  <a 
                    href="https://developer.xero.com/documentation/guides/oauth2/custom-connections/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View Documentation
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client-id">Client ID</Label>
                <Input
                  id="client-id"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Enter your Xero Client ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-secret">Client Secret</Label>
                <Input
                  id="client-secret"
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Enter your Xero Client Secret"
                />
              </div>
            </div>

            <Button size="lg" className="w-full gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Connect to Xero
            </Button>

            <div className="pt-4 border-t text-sm text-muted-foreground">
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