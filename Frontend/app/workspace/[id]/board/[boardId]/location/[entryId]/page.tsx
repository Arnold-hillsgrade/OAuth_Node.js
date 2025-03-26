"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, ExternalLink, Clock, User, Calendar } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/ui/header";
import { useEffect, useState } from "react";
import { useAppContext } from "@/app/context";
import { TimeEntry } from "../../types";
import axios from "axios";
import { getCookie } from "@/app/utils/cookies";

interface Board {
  id: string;
  name: string;
  label: string
}

// Generate a mock time entry for the location detail page
const generateMockTimeEntry = (entryId: string): TimeEntry => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(startDate.getHours() - 3);

  const durationMinutes = 90; // 1.5 hours
  const endDate = new Date(startDate);
  endDate.setMinutes(startDate.getMinutes() + durationMinutes);

  return {
    id: entryId,
    taskName: "Client site inspection",
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
    duration: durationMinutes,
    location: {
      lat: -33.865143,
      lng: 151.209900,
      address: "123 Main Street, Sydney CBD, NSW 2000"
    },
    notes: "Completed initial site assessment for renovation project. Client requested additional quotes for kitchen remodeling.",
    userId: "user-1",
    userName: "John Smith"
  };
};

export default function LocationDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { workspaces } = useAppContext();
  const id = pathname.split("/")[2];
  const boardId = pathname.split("/")[4];
  const entryId = pathname.split("/").pop();
  const [boards, setBoards] = useState<Board[]>([]);

  const [timeEntry, setTimeEntry] = useState<TimeEntry | null>(null);
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
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  }

  useEffect(() => {
    // In a real app, we would fetch the time entry from an API
    // For now, we'll generate a mock entry
    setTimeEntry(generateMockTimeEntry(entryId?.toString() || ""));
  }, []);

  const workspace = workspaces.find(workspace => workspace.id.toString() === id);
  const board = boards.find(b => b.id === boardId);

  if (!workspace || !board || !timeEntry) {
    return null;
  }

  // Format duration as hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Open Google Maps with the location
  const openGoogleMaps = () => {
    if (timeEntry.location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${timeEntry.location.lat},${timeEntry.location.lng}`, '_blank');
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Map */}
          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Location</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={openGoogleMaps}
              >
                <ExternalLink className="h-4 w-4" />
                Open in Google Maps
              </Button>
            </div>

            <div className="relative h-[400px] bg-muted rounded-lg overflow-hidden mb-4">
              {/* This would be replaced with an actual map component */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <MapPin className="h-8 w-8 text-primary mb-2" />
                <p className="text-center font-medium">{timeEntry.location?.address}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Lat: {timeEntry.location?.lat.toFixed(6)}, Lng: {timeEntry.location?.lng.toFixed(6)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">{timeEntry.location?.address}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Location tracked at {formatDate(timeEntry.startTime)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Time Entry Details */}
          <Card className="p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Time Entry Details</h2>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Duration</h3>
                    <p className="text-lg font-semibold">{formatDuration(timeEntry.duration)}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Start:</span> {formatDate(timeEntry.startTime)}
                      </div>
                      <div>
                        <span className="font-medium">End:</span> {timeEntry.endTime ? formatDate(timeEntry.endTime) : "Ongoing"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Task Information</h3>
                <p className="text-lg font-semibold mb-1">{timeEntry.taskName}</p>
                {timeEntry.notes && (
                  <p className="text-muted-foreground">{timeEntry.notes}</p>
                )}
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">Tracked By</h3>
                    <p className="font-semibold">{timeEntry.userName}</p>
                    <p className="text-sm text-muted-foreground">User ID: {timeEntry.userId}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}