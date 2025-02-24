"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const AUSTRALIAN_STATES = [
  { value: "nsw", label: "New South Wales" },
  { value: "vic", label: "Victoria" },
  { value: "qld", label: "Queensland" },
  { value: "wa", label: "Western Australia" },
  { value: "sa", label: "South Australia" },
  { value: "tas", label: "Tasmania" },
  { value: "act", label: "Australian Capital Territory" },
  { value: "nt", label: "Northern Territory" },
];

export default function ConfigureBusiness() {
  const router = useRouter();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
          <h1 className="text-2xl font-bold mb-6">Configure Your Business</h1>

          <div className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                <div
                  className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted"
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="max-w-xs"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Recommended size: 512x512px
                  </p>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" placeholder="Enter company name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Enter phone number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Business Email</Label>
                <Input id="email" type="email" placeholder="Enter business email" />
              </div>

              {/* Business Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Address</h3>
                <div className="space-y-2">
                  <Label htmlFor="street1">Street Address 1</Label>
                  <Input id="street1" placeholder="Enter street address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street2">Street Address 2</Label>
                  <Input id="street2" placeholder="Enter additional address details (optional)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Enter city" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select>
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {AUSTRALIAN_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Post Code</Label>
                  <Input id="postcode" placeholder="Enter post code" maxLength={4} />
                </div>
              </div>

              {/* Business Numbers */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gst">Goods & Services Tax (GST) Number</Label>
                  <Input id="gst" placeholder="Enter GST number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abn">Australian Business Number (ABN)</Label>
                  <Input 
                    id="abn" 
                    placeholder="Enter ABN" 
                    maxLength={11}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acn">Australian Company Number (ACN)</Label>
                  <Input 
                    id="acn" 
                    placeholder="Enter ACN"
                    maxLength={9}
                  />
                </div>
              </div>
            </div>

            <Button className="w-full" size="lg">
              Save Business Configuration
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}