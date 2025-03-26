"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Terminal, Download, Filter, MapPin, Search, List, Map } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { useState, useEffect } from "react";
import { TimeTrackingButton } from "./components/TimeTrackingButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
import { useAppContext } from "@/app/context/index";
import { Badge } from "@/components/ui/badge";
import { TimeEntry } from "./types";
import axios from "axios";
import { getCookie } from "@/app/utils/cookies";

interface Board {
  id: string;
  name: string;
}

export default function BoardDetail() {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname.split('/')[2];
  const boardId = pathname.split('/').pop();
  const [board, setBoard] = useState<Board>();
  const { workspaces, user } = useAppContext();
  const workspace = workspaces.filter(w => w.id.toString() === id);
  const [timeTrackingEnabled, setTimeTrackingEnabled] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [locationFilter, setLocationFilter] = useState<"all" | "with-location" | "without-location">("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchTimeTracking = async () => {
      const timetracking = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/timetracks?workspaceId=${id}&boardId=${boardId}`, { headers: { token: getCookie("token"), Authorization: getCookie("Authorization") } });
      const data: TimeEntry[] = [];
      for (const entry of timetracking.data.tasks) {
        data.push({
          id: entry.id,
          taskName: entry.taskName,
          startTime: entry.startTime ? entry.startTime : "",
          endTime: entry.endTime ? entry.endTime : "",
          duration: entry.endTime && entry.startTime ? calcDuration(entry.startTime, entry.endTime) : 0, // in minutes
          location: {
            lat: 0,
            lng: 0,
            address: entry.location ? entry.location : "",
          },
          userId: user.id,
          userName: user.name,
          notes: entry.notes
        })
      }
      setTimeEntries(data);
    };
    getBoards();
    fetchTimeTracking();
  }, []);

  const getBoards = async () => {
    setLoadingBoards(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workspaces/boards?workspaceId=${id}`, { headers: { token: getCookie("token"), Authorization: getCookie("Authorization") } });
      const data: Board = response.data.board.find((board: any) => board.id == boardId);
      setBoard(data);
    } catch (error) {
      console.error("Error fetching boards:", error);
    } finally {
      setLoadingBoards(false);
    }
  }

  const calcDuration = (startTime: any, endTime: any) => {
    return Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);
  }

  const getTimeTrackingStatus = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/timetracks/status?workspaceId=${id}&boardId=${boardId}`,
        { headers: { token: getCookie("token"), Authorization: getCookie("Authorization") } }
      );
      if (response.data.active) {
        setTimeTrackingEnabled(true);
        setTimeEntries(prev => {
          const matchedEntry = prev.find(entry => entry.id === response.data.taskId);
          if (!matchedEntry) return prev;
          return [
            { ...matchedEntry, endTime: "" },
            ...prev.filter(entry => entry.id !== response.data.taskId)
          ];
        });
      }
    } catch (error) {
      console.error("Error fetching time tracking status:", error);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (timeTrackingEnabled) {
      getTimeTrackingStatus();
      
      intervalId = setInterval(() => {
        setTimeEntries(prev => {
          const activeEntry = prev.find(entry => !entry.endTime);
          if (!activeEntry) return prev;

          const updatedEntry = {
            ...activeEntry,
            duration: Math.floor((new Date().getTime() - new Date(activeEntry.startTime).getTime()) / 60000)
          };

          return [updatedEntry, ...prev.filter(entry => entry.endTime)];
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [timeTrackingEnabled]);

  if (!workspace || !board) {
    return null;
  }

  // Filter time entries
  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.taskName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && !entry.endTime) ||
      (statusFilter === "completed" && entry.endTime);

    const matchesLocation = locationFilter === "all" ||
      (locationFilter === "with-location" && entry.location) ||
      (locationFilter === "without-location" && !entry.location);

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Paginate entries
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Format duration
  const formatDuration = (entry: TimeEntry) => {
    let durationInMinutes: number;

    if (!entry.endTime) {
      if (!entry.startTime) {
        return `${entry.duration}m`;
      }
      // For active entries, calculate duration from start time to now
      durationInMinutes = Math.floor(
        (new Date().getTime() - new Date(entry.startTime).getTime()) / 60000
      );
    } else {
      durationInMinutes = entry.duration;
    }

    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-AU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  // Get entries with location for map view
  const entriesWithLocation = filteredEntries.filter(entry => entry.location !== null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push(`/workspace/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workspace
        </Button>

        <div className="space-y-6">
          {/* Board Info */}
          <Card className="p-6 shadow-lg card-hover">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                  {board.name}
                </h1>
                <p className="text-muted-foreground font-mono text-sm">ID: {board.id}</p>
              </div>
              <TimeTrackingButton
                workspaceId={id}
                boardId={boardId?.toString() || ""}
                setTimeTrackingEnabled={setTimeTrackingEnabled}
              />
            </div>
          </Card>

          {/* Board Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Configuration Card */}
            <Card className="p-6 space-y-4 card-hover">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                <Terminal className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Configuration</h2>
                <p className="text-muted-foreground mb-4 text-sm">
                  Configure board settings and options
                </p>
                <Button
                  onClick={() => router.push(`/workspace/${id}/board/${board.id}/configuration`)}
                  className="w-full"
                >
                  Configure Board
                </Button>
              </div>
            </Card>

            {/* Time Tracking Card */}
            <Card className="p-6 space-y-4 card-hover">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Time Tracking</h2>
                <p className="text-muted-foreground mb-4 text-sm">
                  Configure time tracking settings
                </p>
                <Button
                  onClick={() => router.push(`/workspace/${id}/board/${board.id}/time-tracking`)}
                  className="w-full"
                >
                  Configure Time Tracking
                </Button>
              </div>
            </Card>

            {/* Export Card */}
            <Card className="p-6 space-y-4 card-hover">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Export Data</h2>
                <p className="text-muted-foreground mb-4 text-sm">
                  Export board data and reports
                </p>
                <Button
                  onClick={() => router.push(`/workspace/${id}/board/${board.id}/export`)}
                  className="w-full"
                >
                  Export Data
                </Button>
              </div>
            </Card>
          </div>

          {/* Time Tracking Entries */}
          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Time Tracking Entries</h2>
                <p className="text-muted-foreground">View and manage time entries for tasks in this board</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setViewMode("list")}>
                  <List className="h-4 w-4" />
                  List View
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setViewMode("map")}>
                  <Map className="h-4 w-4" />
                  Map View
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by task name or user..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={locationFilter} onValueChange={(value: typeof locationFilter) => setLocationFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="with-location">With Location</SelectItem>
                    <SelectItem value="without-location">Without Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {viewMode === "list" ? (
              <>
                {/* List View */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {!entry.endTime ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              Completed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{entry.taskName}</TableCell>
                        <TableCell>{entry.startTime ? formatDate(entry.startTime) : ""}</TableCell>
                        <TableCell>{formatDuration(entry)}</TableCell>
                        <TableCell>
                          {entry.location ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-primary"
                              onClick={() => router.push(`/workspace/${id}/board/${board.id}/location/${entry.id}`)}
                            >
                              <MapPin className="h-3 w-3" />
                              View Location
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not tracked</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/workspace/${id}/board/${board.id}/location/${entry.id}`)}
                          >
                            View Details
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
              </>
            ) : (
              /* Map View */
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-muted-foreground">
                    Showing {entriesWithLocation.length} time entries with location data
                  </p>
                </div>

                <div className="relative h-[500px] bg-muted rounded-lg overflow-hidden">
                  {/* This would be replaced with an actual map component */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-2">Map View</p>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/workspace/${id}/board/${board.id}/map-view`)}
                      >
                        View Full Map
                      </Button>
                    </div>
                  </div>

                  {/* Sample map markers */}
                  {entriesWithLocation.slice(0, 5).map((entry, index) => (
                    <div
                      key={entry.id}
                      className="absolute w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer"
                      style={{
                        left: `${20 + (index * 15)}%`,
                        top: `${30 + (index * 10)}%`
                      }}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                  ))}

                  {/* Selected entry popup */}
                  {selectedEntry && (
                    <div
                      className="absolute bg-card p-4 rounded-lg shadow-lg w-64"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{selectedEntry.taskName}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setSelectedEntry(null)}
                        >
                          ×
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {formatDate(selectedEntry.startTime)}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        Duration: {formatDuration(selectedEntry)}
                      </p>
                      {selectedEntry.location && (
                        <p className="text-sm mb-3">{selectedEntry.location.address}</p>
                      )}
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/workspace/${id}/board/${boardId}/location/${selectedEntry.id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedEntry.location?.lat},${selectedEntry.location?.lng}`, '_blank')}
                        >
                          Google Maps
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* List of locations */}
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-3">All Locations</h3>
                  <div className="space-y-2">
                    {entriesWithLocation.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div>
                          <p className="font-medium">{entry.taskName}</p>
                          <p className="text-sm text-muted-foreground">{entry.location?.address}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/workspace/${id}/board/${boardId}/location/${entry.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                    {entriesWithLocation.length > 5 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/workspace/${id}/board/${boardId}/map-view`)}
                      >
                        View All Locations
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}