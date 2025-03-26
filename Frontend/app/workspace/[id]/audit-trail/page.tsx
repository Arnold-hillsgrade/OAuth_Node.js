"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, Download } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useState } from "react";
import axios from "axios";
import { getCookie } from "@/app/utils/cookies";

const ITEMS_PER_PAGE = 10;
interface AuditTrailItem {
  timestamp: string;
  action: string;
  user: string;
  ipAddress: string;
  detail: string;
}

export default function AuditTrailPage() {
  const router = useRouter();
  const id = usePathname().split('/')[2];
  const [searchQuery, setSearchQuery] = useState("");  const [currentPage, setCurrentPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [auditTrail, setAuditTrail] = useState<AuditTrailItem[]>([]);

  useEffect(() => {
    const fetchAuditTrailData = async () => {
      const data = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/audit/`, { headers: { token: getCookie("token") }, params: { workspaceId: id } });
      const auditData = data.data.map((item: any) => {
        return { 
          action: item.action, 
          user: item.userEmail, 
          ipAddress: item.userIp, 
          detail: item.detail, 
          timestamp: new Date(item.createdAt).toLocaleString('en-AU', { 
            month: 'numeric', 
            day: 'numeric', 
            year: 'numeric', 
            hour: 'numeric', 
            minute: 'numeric', 
            second: 'numeric', 
            hour12: true 
          }) 
        }
      })
      setAuditTrail(auditData);
    }
    fetchAuditTrailData();
  }, []);

  // Get unique actions and users for filters
  const uniqueActions = Array.from(new Set(auditTrail.map(item => item.action)));
  const uniqueUsers = Array.from(new Set(auditTrail.map(item => item.user)));

  // Filter audit trail based on search and filters
  const filteredAuditTrail = auditTrail.filter(item => {
    const matchesSearch =
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ipAddress.includes(searchQuery);

    const matchesAction = actionFilter === "all" || item.action === actionFilter;
    const matchesUser = userFilter === "all" || item.user === userFilter;

    return matchesSearch && matchesAction && matchesUser;
  });

  const totalPages = Math.ceil(filteredAuditTrail.length / ITEMS_PER_PAGE);
  const currentItems = filteredAuditTrail.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
          Back to Workspace
        </Button>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Audit Trail</h1>
                <p className="text-muted-foreground">
                  Track all activities and changes in your workspace
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Audit Log
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search audit trail..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActions.map((action, index) => (
                      <SelectItem key={index} value={action || "unknown"}>{action || "Unknown Action"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {uniqueUsers.map((user, index) => (
                      <SelectItem key={index} value={user || "unknown"}>{user || "Unknown User"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Audit Trail Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{item.action}</TableCell>
                    <TableCell>{item.user}</TableCell>
                    <TableCell className="font-mono">{item.ipAddress}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      <span className="text-muted-foreground">
                        {item.detail}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
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
                      <div key={`pagination-${page}`} style={{display: "flex"}}>
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
          </Card>
        </div>
      </div>
    </div>
  );
}