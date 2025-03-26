"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, ExternalLink, Search, Calendar } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/ui/header";
import { useEffect, useState } from "react";
import { TimeEntry } from "../types";
import { Input } from "@/components/ui/input";
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
import { useAppContext } from "@/app/context";
import axios from "axios";
import { getCookie } from "@/app/utils/cookies";

interface Board {
  id: string;
  name: string;
  label: string
}

export default function MapViewPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { workspaces } = useAppContext();
  const [boards, setBoards] = useState<Board[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const id = pathname.split("/")[2];
  const boardId = pathname.split("/")[4];

  useEffect(() => {
    if (boards.length === 0)
      getBoards();
  }, []);

  const getBoards = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workspaces/boards?workspaceId=${id}`, { headers: { token: getCookie("token"), Authorization: getCookie("Authorization") } });
      const data: Board[] = await Promise.all(
        response.data.board.map(async (board: any) => {
          try {
            const boardResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/boards?id=${board.id}`, { headers: { token: getCookie("token"), Authorization: getCookie("Authorization") } });
            return { ...board, label: boardResponse.data.board.label };
          } catch (error) {
            console.error("Error fetching board:", error);
            return { ...board, label: null };
          }
        })
      );
      setBoards(data);
      setTimeEntries(generateMockTimeEntries());
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  }

  const workspace = workspaces.find(workspace => workspace.id.toString() === id);
  const board = boards.find(b => b.id === boardId);

  // Generate mock time entries with locations
  const generateMockTimeEntries = (): TimeEntry[] => {
    const tasks = [
      "Client consultation",
      "Site inspection",
      "Documentation review",
      "Equipment installation",
      "Follow-up call",
      "Maintenance check",
      "Training session",
      "Report preparation",
      "Client meeting",
      "Emergency repair"
    ];

    const locations = [
      { lat: -33.865143, lng: 151.209900, address: "Sydney CBD, NSW" },
      { lat: -33.891844, lng: 151.199593, address: "Newtown, NSW" },
      { lat: -33.918861, lng: 151.226263, address: "Randwick, NSW" },
      { lat: -33.856680, lng: 151.215256, address: "North Sydney, NSW" },
      { lat: -33.733810, lng: 150.982318, address: "Castle Hill, NSW" },
      { lat: -33.803482, lng: 151.088196, address: "Parramatta, NSW" },
      { lat: -33.924374, lng: 151.259052, address: "Maroubra, NSW" },
      { lat: -33.870666, lng: 151.093674, address: "Strathfield, NSW" },
      { lat: -33.843082, lng: 151.251343, address: "Bondi, NSW" },
      { lat: -33.917967, lng: 151.025508, address: "Bankstown, NSW" },
      { lat: -33.766382, lng: 151.287888, address: "Manly, NSW" },
      { lat: -33.753746, lng: 150.687042, address: "Penrith, NSW" }
    ];

    return Array.from({ length: 30 }, (_, i) => {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - Math.floor(Math.random() * 14)); // Random day in the last 2 weeks
      startDate.setHours(9 + Math.floor(Math.random() * 8)); // Between 9am and 5pm
      startDate.setMinutes(Math.floor(Math.random() * 60));

      const durationMinutes = 15 + Math.floor(Math.random() * 240); // 15 min to 4 hours
      const endDate = new Date(startDate);
      endDate.setMinutes(startDate.getMinutes() + durationMinutes);

      const taskIndex = Math.floor(Math.random() * tasks.length);
      const locationIndex = Math.floor(Math.random() * locations.length);

      return {
        id: `time-${i + 1}`,
        taskName: tasks[taskIndex],
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        duration: durationMinutes,
        location: locations[locationIndex],
        notes: Math.random() > 0.7 ? "Additional notes for this time entry" : "",
        userId: `user-${Math.floor(Math.random() * 5) + 1}`,
        userName: ["John Smith", "Jane Doe", "Mike Johnson", "Sarah Williams", "Alex Brown"][Math.floor(Math.random() * 5)]
      };
    }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()); // Sort by most recent
  };

  if (!workspace || !board) {
    return null;
  }

  // Filter time entries based on search query and date filter
  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.taskName.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesDate = true;
    if (dateFilter !== "all") {
      const entryDate = new Date(entry.startTime);
      const today = new Date();

      if (dateFilter === "today") {
        matchesDate = entryDate.toDateString() === today.toDateString();
      } else if (dateFilter === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        matchesDate = entryDate.toDateString() === yesterday.toDateString();
      } else if (dateFilter === "thisWeek") {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        matchesDate = entryDate >= weekStart;
      }
    }

    return matchesSearch && matchesDate;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Open Google Maps with the location
  const openGoogleMaps = (location: TimeEntry["location"]) => {
    if (location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push(`/workspace/${id}/board/${boardId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Board
        </Button>

        <Card className="p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Location Map View</h1>
              <p className="text-muted-foreground">
                View all time entries with location data for {board.name}
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by task name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-[200px]">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Map View */}
          <div className="relative h-[500px] bg-muted rounded-lg overflow-hidden mb-6">
            {/* This would be replaced with an actual map component */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Interactive Map</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Showing {filteredEntries.length} locations
                </p>
              </div>
            </div>

            {/* Sample map markers */}
            {filteredEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="absolute w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  left: `${10 + (index % 6) * 15}%`,
                  top: `${20 + Math.floor(index / 6) * 15}%`
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
                  User: {selectedEntry.userName}
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
                    onClick={() => openGoogleMaps(selectedEntry.location)}
                  >
                    Google Maps
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Location List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">All Locations</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.taskName}</TableCell>
                    <TableCell>{formatDate(entry.startTime)}</TableCell>
                    <TableCell>{entry.userName}</TableCell>
                    <TableCell>{entry.location?.address}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/workspace/${id}/board/${boardId}/location/${entry.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openGoogleMaps(entry.location)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}