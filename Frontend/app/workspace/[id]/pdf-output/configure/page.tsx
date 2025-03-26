"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DOCUMENT_TYPES = [
  "Quote",
  "Purchase Order",
  "Invoice",
  "Employee Agreement",
  "Contractor Agreement",
];

export default function ConfigurePDFPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to PDF Output
        </Button>

        <div className="space-y-6 max-w-4xl mx-auto">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-6">Configure PDF Output</h1>

            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic PDF</TabsTrigger>
                <TabsTrigger value="adobe">Adobe Sign</TabsTrigger>
                <TabsTrigger value="docusign">DocuSign</TabsTrigger>
                <TabsTrigger value="pandadoc">PandaDoc</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Basic PDF Output</Label>
                      <p className="text-sm text-muted-foreground">
                        Generate PDFs without digital signatures
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  {/* Template Selection for each document type */}
                  {DOCUMENT_TYPES.map((docType) => (
                    <div key={docType} className="space-y-2">
                      <Label>{docType} Template</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${docType} template`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="template1">Template 1</SelectItem>
                          <SelectItem value="template2">Template 2</SelectItem>
                          <SelectItem value="template3">Template 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="adobe" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Adobe Sign Integration</Label>
                      <p className="text-sm text-muted-foreground">
                        Use Adobe Sign for digital signatures
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="space-y-2">
                    <Label>Client ID</Label>
                    <Input type="password" placeholder="Enter your Adobe Sign Client ID" />
                  </div>

                  <div className="space-y-2">
                    <Label>Client Secret</Label>
                    <Input type="password" placeholder="Enter your Adobe Sign Client Secret" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="docusign" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable DocuSign Integration</Label>
                      <p className="text-sm text-muted-foreground">
                        Use DocuSign for digital signatures
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="space-y-2">
                    <Label>Integration Key</Label>
                    <Input type="password" placeholder="Enter your DocuSign Integration Key" />
                  </div>

                  <div className="space-y-2">
                    <Label>Account ID</Label>
                    <Input placeholder="Enter your DocuSign Account ID" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pandadoc" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable PandaDoc Integration</Label>
                      <p className="text-sm text-muted-foreground">
                        Use PandaDoc for digital signatures
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input type="password" placeholder="Enter your PandaDoc API Key" />
                  </div>

                  <div className="space-y-2">
                    <Label>Workspace ID</Label>
                    <Input placeholder="Enter your PandaDoc Workspace ID" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
              <Button size="lg">Save Configuration</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}