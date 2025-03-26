"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Spinner from "@/components/ui/spin";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, History, Terminal, Download, Filter, AlertTriangle, AlertCircle, Info, Bug, XCircle } from "lucide-react";
import { Header } from "@/components/ui/header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCookie } from "../utils/cookies";
import { useAppContext, Workspace } from "../context";

interface Log {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  source: string;
  details: Object;
};

// Mock data for audit trail
const generateAuditTrail = () => Array.from({ length: 50 }, (_, i) => {
  const date = new Date();
  date.setHours(date.getHours() - i);

  const actions = [
    "Created new board",
    "Updated board settings",
    "Deleted board",
    "Added user to workspace",
    "Removed user from workspace",
    "Updated workspace settings",
    "Generated PDF document",
    "Updated business configuration",
    "Connected to Xero",
    "Updated integration settings"
  ];

  const users = [
    "john.doe@example.com",
    "jane.smith@example.com",
    "mike.wilson@example.com",
    "sarah.johnson@example.com"
  ];

  return {
    id: `audit - ${i + 1} `,
    timestamp: date.toISOString(),
    action: actions[Math.floor(Math.random() * actions.length)],
    user: users[Math.floor(Math.random() * users.length)],
    ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)} `,
    details: {
      resourceId: `resource - ${Math.floor(Math.random() * 1000)} `,
      changes: Math.random() > 0.5 ? { before: "old value", after: "new value" } : null
    }
  };
});

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  DEBUG: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
  INFO: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  WARN: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
  ERROR: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  FATAL: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
};

const LOG_LEVEL_ICONS: Record<LogLevel, React.ReactNode> = {
  DEBUG: <Bug className="h-4 w-4" />,
  INFO: <Info className="h-4 w-4" />,
  WARN: <AlertTriangle className="h-4 w-4" />,
  ERROR: <AlertCircle className="h-4 w-4" />,
  FATAL: <XCircle className="h-4 w-4" />
};

function WorkspacesList({
  isLoading,
  filteredWorkspaces,
  searchQuery,
  setSearchQuery,
  router
}: {
  isLoading: boolean,
  filteredWorkspaces: Workspace[],
  searchQuery: string,
  setSearchQuery: (query: string) => void,
  router: ReturnType<typeof useRouter>
}) {
  return (
    <Card className="p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Your Workspaces</h3>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by workspace ID or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ?
        <div className="text-center py-8 text-muted-foreground">
          Loading workspaces...
          <Spinner />
        </div>
        :
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkspaces.map((workspace) => (
                <TableRow key={workspace.id}>
                  <TableCell className="font-mono">{workspace.id}</TableCell>
                  <TableCell>{workspace.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/workspace/${workspace.id} `)}
                    >
                      Open Workspace
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredWorkspaces.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No workspaces found matching your search.
            </div>
          )}
        </>
      }
    </Card >
  );
}

function GlobalAuditTrail() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [auditTrail] = useState(() => generateAuditTrail());

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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Global Audit Trail</h1>
          <p className="text-muted-foreground">
            Track all activities and changes across all workspaces
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
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>{action}</SelectItem>
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
              {uniqueUsers.map(user => (
                <SelectItem key={user} value={user}>{user}</SelectItem>
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
          {filteredAuditTrail.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="whitespace-nowrap">
                {new Date(item.timestamp).toLocaleString()}
              </TableCell>
              <TableCell>{item.action}</TableCell>
              <TableCell>{item.user}</TableCell>
              <TableCell className="font-mono">{item.ipAddress}</TableCell>
              <TableCell className="max-w-xs truncate">
                {item.details.changes ? (
                  <span className="text-muted-foreground">
                    Changed from "{item.details.changes.before}" to "{item.details.changes.after}"
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Resource ID: {item.details.resourceId}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function GlobalApplicationLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    getLogs();
  }, []);

  const getLogs = async () => {
    setLoading(true);
    try {
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/log`, { headers: { token: getCookie("token") } })
        .then(res => {
          return res.data.map((item: any, i: number) => {
            return {
              id: `log - ${i + 1} `,
              timestamp: item.timestamp,
              level: item.level.toUpperCase(),
              message: item.message,
              source: item.metadata.source,
              details: {
                metadata: {
                  ...item.metadata
                }
              }
            }
          });
        }).then(data => {
          setLogs(data);
        });
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }

  const uniqueSources = (logs || []).map(log => log.source).filter((value, index, self) => self.indexOf(value) === index);

  const filteredLogs = (logs || []).filter(log => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesSource = sourceFilter === "all" || log.source === sourceFilter;

    return matchesSearch && matchesLevel && matchesSource;
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Application Logs</h1>
          <p className="text-muted-foreground">
            Monitor system logs and debug application issues across all workspaces
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Log level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {Object.keys(LOG_LEVEL_COLORS).map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {uniqueSources.map(source => (
                <SelectItem key={source as string} value={source as string}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ?
        <div className="text-center py-8 text-muted-foreground">
          Loading workspaces...
          <Spinner />
        </div>
        :
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <React.Fragment key={log.id as string}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id as string)}
                  >
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.timestamp as string).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${LOG_LEVEL_COLORS[log.level as LogLevel]}`}>
                        {LOG_LEVEL_ICONS[log.level as LogLevel]}
                        {log.level}
                      </span>
                    </TableCell>
                    <TableCell>{log.source}</TableCell>
                    <TableCell className="max-w-xl truncate">
                      {log.message}
                    </TableCell>
                  </TableRow>
                  {expandedLog === log.id && (
                    <TableRow>
                      <TableCell colSpan={4} className="bg-muted/30">
                        <div className="p-4 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Metadata</h4>
                            <pre className="text-sm bg-muted p-2 rounded-md overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No logs found matching your search.
            </div>
          )}
        </>
      }
    </Card>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { workspaces, setWorkspaces, user } = useAppContext();
  const [loading, setLoading] = useState(false);

  const filteredWorkspaces = workspaces.filter(item =>
    item.id.toString().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (workspaces.length === 0)
      getWorkspaces();
    }, []);

  const getWorkspaces = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workspaces`, { headers: { token: getCookie("token"), Authorization: getCookie("Authorization") } });
      setWorkspaces(response.data.workspace);

      if (response.data.workspace.length === 1)
        router.push(`/workspace/${workspaces[0].id}`);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 space-y-8">
        <Tabs defaultValue="workspaces" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
            {user.role === "admin" && (
              <TabsTrigger value="audit" className="gap-2">
                <History className="h-4 w-4" />
                Global Audit Trail
              </TabsTrigger>
            )}
            {user.role === "admin" && (
              <TabsTrigger value="logs" className="gap-2">
                <Terminal className="h-4 w-4" />
                Application Logs
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="workspaces">
            <WorkspacesList
              isLoading={loading}
              filteredWorkspaces={filteredWorkspaces}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              router={router}
            />
          </TabsContent>

          {user.role === "admin" && (
            <TabsContent value="audit">
              <GlobalAuditTrail />
            </TabsContent>
          )}

          {user.role === "admin" && (
            <TabsContent value="logs">
              <GlobalApplicationLogs />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}