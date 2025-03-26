"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { getDistance } from 'geolib';

interface Task {
  id: string;
  name: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

// Mock tasks - in a real app, these would come from your backend
const MOCK_TASKS: Task[] = [
  {
    id: "task-1",
    name: "Site Inspection - CBD Office",
    location: {
      latitude: -33.8688,
      longitude: 151.2093,
      address: "123 Pitt St, Sydney NSW 2000"
    }
  },
  {
    id: "task-2",
    name: "Equipment Installation - North Shore",
    location: {
      latitude: -33.8402,
      longitude: 151.2091,
      address: "45 Miller St, North Sydney NSW 2060"
    }
  }
];

const PROXIMITY_THRESHOLD = 50; // 50 meters radius

interface TimeTrackingButtonProps {
  workspaceId: string;
  boardId: string;
  setTimeTrackingEnabled: any
}

export function TimeTrackingButton({ workspaceId, boardId, setTimeTrackingEnabled }: TimeTrackingButtonProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showProximityWarning, setShowProximityWarning] = useState(false);
  const [showComplianceWarning, setShowComplianceWarning] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [startLocation, setStartLocation] = useState<GeolocationPosition | null>(null);
  const [endLocation, setEndLocation] = useState<GeolocationPosition | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTracking) {
      timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTracking]);

  useEffect(() => {
    // Load tracking status from localStorage on component mount
    const storedTracking = localStorage.getItem(`timeTracking_${workspaceId}_${boardId}`);
    if (storedTracking) {
      const trackingData = JSON.parse(storedTracking);
      setIsTracking(true);
      setSelectedTask(trackingData.task);
      setStartTime(new Date(trackingData.startTime));
      setTimeTrackingEnabled(true);
    }
  }, [workspaceId, boardId]);

  const formatDuration = (start: Date, end: Date) => {
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setShowComplianceWarning(true);
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      return position;
    } catch (error) {
      setShowLocationPrompt(true);
      return null;
    }
  };

  const checkTaskProximity = (position: GeolocationPosition, task: Task) => {
    if (!task.location) return true;

    const distance = getDistance(
      { latitude: position.coords.latitude, longitude: position.coords.longitude },
      { latitude: task.location.latitude, longitude: task.location.longitude }
    );

    return distance <= PROXIMITY_THRESHOLD;
  };

  const handleStartTracking = async () => {
    const position = await requestLocation();
    if (!position) return;

    if (selectedTask?.location && !checkTaskProximity(position, selectedTask)) {
      setShowProximityWarning(true);
      return;
    }

    const startTimeStamp = new Date();
    setStartLocation(position);
    setStartTime(startTimeStamp);
    setIsTracking(true);
    setTimeTrackingEnabled(true);
    setShowTaskDialog(false);

    // Store tracking data in localStorage
    localStorage.setItem(`timeTracking_${workspaceId}_${boardId}`, JSON.stringify({
      isTracking: true,
      task: selectedTask,
      startTime: startTimeStamp.toISOString(),
    }));
  };

  const handleStopTracking = async () => {
    const position = await requestLocation();
    if (position) {
      setEndLocation(position);
    }

    const endTimeStamp = new Date();
    setIsTracking(false);
    setTimeTrackingEnabled(false);
    setShowSummary(true);

    // Store end time and clear tracking status
    const trackingKey = `timeTracking_${workspaceId}_${boardId}`;
    const trackingData = JSON.parse(localStorage.getItem(trackingKey) || '{}');
    localStorage.setItem(`timeTracking_${workspaceId}_${boardId}_history`, JSON.stringify({
      ...trackingData,
      endTime: endTimeStamp.toISOString(),
    }));
    localStorage.removeItem(trackingKey);
  };

  const handleClockInClick = () => {
    setSelectedTask(null);
    setShowTaskDialog(true);
  };

  return (
    <>
      {!isTracking && !showSummary && (
        <Button
          size="lg"
          className="gap-2"
          onClick={handleClockInClick}
        >
          <Clock className="h-5 w-5" />
          Clock In
        </Button>
      )}

      {isTracking && (
        <Card className="p-4 bg-primary/5 border-primary">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Currently working on</p>
            <p className="font-medium">{selectedTask?.name}</p>
            <p className="text-2xl font-mono font-bold">
              {startTime && formatDuration(startTime, currentTime)}
            </p>
            <Button
              variant="destructive"
              onClick={handleStopTracking}
            >
              Clock Out
            </Button>
          </div>
        </Card>
      )}

      {/* Task Selection Dialog */}
      <AlertDialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Select Task</AlertDialogTitle>
            <AlertDialogDescription>
              Choose a task to start tracking time. Location tracking will be required.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select
              value={selectedTask?.id || ""}
              onValueChange={(value) => setSelectedTask(MOCK_TASKS.find(task => task.id === value) || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_TASKS.map(task => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTask?.location && (
              <div className="mt-4 p-3 bg-muted rounded-lg flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1" />
                <div className="text-sm">
                  <p className="font-medium">Task Location</p>
                  <p className="text-muted-foreground">{selectedTask.location.address}</p>
                </div>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartTracking} disabled={!selectedTask}>
              Start Tracking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Location Permission Dialog */}
      <AlertDialog open={showLocationPrompt} onOpenChange={setShowLocationPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Access Required
            </AlertDialogTitle>
            <AlertDialogDescription>
              This application requires access to your location for time tracking purposes.
              Please enable location access in your browser settings to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowTaskDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => requestLocation()}>
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Proximity Warning Dialog */}
      <AlertDialog open={showProximityWarning} onOpenChange={setShowProximityWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Not at Task Location
            </AlertDialogTitle>
            <AlertDialogDescription>
              You appear to be more than 50 meters away from the task location.
              Are you sure you want to start tracking time?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowTaskDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowProximityWarning(false);
              setStartTime(new Date());
              setIsTracking(true);
              setTimeTrackingEnabled(true);
            }}>
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Compliance Warning Dialog */}
      <AlertDialog open={showComplianceWarning} onOpenChange={setShowComplianceWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Location Services Required
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your browser does not support or has disabled location services.
              Location tracking is required by company policy for time tracking.
              Please enable location services to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowComplianceWarning(false)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Tracking Summary */}
      <AlertDialog open={showSummary} onOpenChange={setShowSummary}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time Tracking Summary</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Task</h4>
              <p>{selectedTask?.name}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Duration</h4>
              <p className="text-xl font-mono">
                {startTime && formatDuration(startTime, new Date())}
              </p>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Started: {startTime?.toLocaleString()}</p>
                <p>Ended: {new Date().toLocaleString()}</p>
              </div>
            </div>

            {startLocation && (
              <div>
                <h4 className="text-sm font-medium mb-2">Clock In Location</h4>
                <p className="text-sm">
                  Latitude: {startLocation.coords.latitude.toFixed(6)}
                  <br />
                  Longitude: {startLocation.coords.longitude.toFixed(6)}
                </p>
              </div>
            )}

            {endLocation && (
              <div>
                <h4 className="text-sm font-medium mb-2">Clock Out Location</h4>
                <p className="text-sm">
                  Latitude: {endLocation.coords.latitude.toFixed(6)}
                  <br />
                  Longitude: {endLocation.coords.longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowSummary(false);
              setSelectedTask(null);
              setStartTime(null);
              setStartLocation(null);
              setEndLocation(null);
            }}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}