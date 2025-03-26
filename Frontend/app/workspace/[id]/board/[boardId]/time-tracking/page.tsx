"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/ui/header";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAppContext } from "@/app/context";
import axios from "axios";
import { getCookie } from "@/app/utils/cookies";

interface Board {
  id: string;
  name: string;
  label: string
}

export default function TimeTrackingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [boards, setBoards] = useState<Board[]>([]);
  const [timeTrackingEnabled, setTimeTrackingEnabled] = useState(false);
  const { workspaces } = useAppContext();
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
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  }

  const workspace = workspaces.find(workspace => workspace.id.toString() === id);
  const board = boards.find(b => b.id === boardId);

  if (!workspace || !board) {
    return null;
  }

  const handleSaveSettings = () => {
    // Save settings
    toast.success("Time tracking settings saved successfully");
    router.push(`/workspace/${id}/board/${boardId}`);
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

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Time Tracking</h1>
                  <p className="text-muted-foreground">
                    Configure time tracking settings for this board
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="time-tracking">Enable Time Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track time spent on tasks in this board
                  </p>
                </div>
                <Switch
                  id="time-tracking"
                  checked={timeTrackingEnabled}
                  onCheckedChange={setTimeTrackingEnabled}
                />
              </div>

              <div className="border-t pt-6">
                <Button 
                  className="w-full"
                  onClick={handleSaveSettings}
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}