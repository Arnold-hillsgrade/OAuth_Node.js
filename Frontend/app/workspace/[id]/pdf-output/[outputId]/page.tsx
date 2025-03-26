"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { useEffect, useState } from "react";
import { PDFOutput } from "../types";
import axios from "axios";
import { getCookie } from "@/app/utils/cookies";

export default function PDFOutputDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname.split('/')[2];
  const [allPdfOutputs, setAllPdfOutputs] = useState<PDFOutput[]>([]);
  const output = allPdfOutputs.find(output => output.id === `pdf-${id}`);

  useEffect(() => {
    const fetchingPDFOutputHistory = async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pdf`, { headers: { token: getCookie("token") }, params: { workspaceId: id } });
      if (response.status === 200) {
        const result = response.data.map((item: any) => {
          return {
            id: item.itemId,
            type: item.type,
            createdAt: new Date(item.createdAt).toLocaleString('en-AU', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              hour12: true
            }),
            createdBy: item.createdBy,
            signatureProvider: "ISOPlus",
            signed: item.SignatureStatus,
            documentName: item.pdfLink.split('/').pop().split('.pdf')[0]
          }
        });
        setAllPdfOutputs(result);
      }
    }
    fetchingPDFOutputHistory();
  }, []);

  useEffect(() => {
    if (!output) {
      router.push(`/workspace/${id}/pdf-output`);
    }
  }, [output, router, id]);

  if (!output) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push(`/workspace/${id}/pdf-output`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to PDF Output
        </Button>

        <div className="space-y-6 max-w-3xl mx-auto">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{output.documentName}</h1>
                <p className="text-muted-foreground">
                  {output.type} • {output.size}
                </p>
              </div>
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                  <p className="text-sm">{output.createdBy}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(output.createdAt).toLocaleString()}
                  </p>
                </div>

                {output.signed && output.signedBy && output.signedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Signed By</h3>
                    <p className="text-sm">{output.signedBy}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(output.signedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Signature Status</h3>
                  <p className="text-sm">
                    {output.signed && output.signatureProvider ? (
                      <span className="text-green-600">
                        Signed via {output.signatureProvider}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Unsigned</span>
                    )}
                  </p>
                </div>
              </div>

              {/* <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Document Details</h3>
                <dl className="space-y-2">
                  {Object.entries(output.metadata).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </dt>
                      <dd className="text-sm font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div> */}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}