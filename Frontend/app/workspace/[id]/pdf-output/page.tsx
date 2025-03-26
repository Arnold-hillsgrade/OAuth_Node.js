"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Download } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { PDFOutput } from "./types";
import axios from "axios";
import { getCookie } from "@/app/utils/cookies";

const ITEMS_PER_PAGE = 10;

export default function PDFOutputPage() {
    const router = useRouter();
    const pathname = usePathname();
    const id = pathname.split("/")[2];
    const [basicPdfEnabled, setBasicPdfEnabled] = useState(true);
    const [selectedSignatureProvider, setSelectedSignatureProvider] = useState<string | null>("docusign");
    const [currentPage, setCurrentPage] = useState(1);
    const [allPdfOutputs, setAllPdfOutputs] = useState<PDFOutput[]>([]);
    const usageData = [
        {
            type: "Purchase Order",
            totalUsage: 523,
            currentCycle: 45,
        },
        {
            type: "Invoice",
            totalUsage: 892,
            currentCycle: 76,
        },
        {
            type: "Quote",
            totalUsage: 234,
            currentCycle: 21,
        },
        {
            type: "Employee Agreement",
            totalUsage: 156,
            currentCycle: 12,
        },
        {
            type: "Contractor Agreement",
            totalUsage: 37,
            currentCycle: 4,
        },
    ];

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

    const totalPages = Math.ceil(allPdfOutputs.length / ITEMS_PER_PAGE);
    const pdfOutputs = allPdfOutputs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleDownloadPDF = async (output: PDFOutput) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pdf/`, {
                workspaceId: id
            }, {
                headers: { token: getCookie("token") },
                responseType: 'arraybuffer'
            });

            // Create blob from array buffer
            const blob = new Blob([response.data], { type: 'application/pdf' });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${output.documentName}.pdf`;

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error generating PDF:', err);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto py-8">
                <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => router.replace(`/workspace/${id}`)}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Workspace
                </Button>

                <div className="space-y-6 max-w-6xl mx-auto">
                    {/* PDF Output Configuration */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold">PDF Output Configuration</h1>
                                <p className="text-muted-foreground">
                                    Configure PDF generation and digital signature settings
                                </p>
                            </div>
                            <Button onClick={() => router.push(`/workspace/${id}/pdf-output/configure`)}>
                                Setup
                            </Button>
                        </div>

                        {/* Configuration Options */}
                        <div className="space-y-6 mb-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Basic PDF Output</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable basic PDF generation without digital signatures
                                    </p>
                                </div>
                                <Switch
                                    checked={basicPdfEnabled}
                                    onCheckedChange={setBasicPdfEnabled}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Digital Signature Provider</Label>
                                <Select
                                    value={selectedSignatureProvider || ""}
                                    onValueChange={setSelectedSignatureProvider}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="adobe">Adobe Sign</SelectItem>
                                        <SelectItem value="docusign">DocuSign</SelectItem>
                                        <SelectItem value="pandadoc">PandaDoc</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Only one digital signature provider can be active at a time
                                </p>
                            </div>
                        </div>

                        {/* Usage Summary */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Usage Summary</h2>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Document Type</TableHead>
                                        <TableHead className="text-right">Current Cycle</TableHead>
                                        <TableHead className="text-right">Total Usage</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usageData.map((usage) => (
                                        <TableRow key={usage.type}>
                                            <TableCell>{usage.type}</TableCell>
                                            <TableCell className="text-right">{usage.currentCycle}</TableCell>
                                            <TableCell className="text-right">{usage.totalUsage}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* PDF Output History */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Output History</h2>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead>Created By</TableHead>
                                        <TableHead>Signature Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pdfOutputs.map((output, index) => (
                                        <TableRow
                                            key={index}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.push(`/workspace/${id}/pdf-output/${output.id}`)}
                                        >
                                            <TableCell>{output.type}</TableCell>
                                            <TableCell>{new Date(output.createdAt).toLocaleString()}</TableCell>
                                            <TableCell>{output.createdBy}</TableCell>
                                            <TableCell>
                                                {output.signed ? (
                                                    <span className="text-green-600 font-medium">
                                                        Signed via {output.signatureProvider}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">Unsigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDownloadPDF(output);
                                                    }}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-4 flex justify-center">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>

                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(page =>
                                                    page === 1 ||
                                                    page === totalPages ||
                                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                                )
                                                .map((page, i, arr) => (
                                                    <div key={`pagination-${page}`} style={{ display: "flex" }}>
                                                        {i > 0 && arr[i - 1] !== page - 1 && (
                                                            <PaginationItem>
                                                                <PaginationEllipsis />
                                                            </PaginationItem>
                                                        )}
                                                        <PaginationItem>
                                                            <PaginationLink
                                                                onClick={() => setCurrentPage(page)}
                                                                isActive={currentPage === page}
                                                            >
                                                                {page}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    </div>
                                                ))}

                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
