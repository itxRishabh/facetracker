"use client";

import type { RecordedVideo } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Trash2, Film } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface VideoListProps {
  videos: RecordedVideo[];
  onDelete: (id: string) => void;
}

export function VideoList({ videos, onDelete }: VideoListProps) {
  if (videos.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Recorded Videos</CardTitle>
          <CardDescription>Your recorded videos will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center h-64 text-muted-foreground border-2 border-dashed rounded-lg">
          <Film className="h-12 w-12 mb-4" />
          <p className="font-medium">No Videos Recorded Yet</p>
          <p className="text-sm">Press "Start Recording" to begin.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recorded Videos</CardTitle>
        <CardDescription>Review and manage your saved recordings.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-250px)] lg:h-[450px] pr-4">
          <ul className="space-y-3">
            {videos.map((video) => (
              <li key={video.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg shadow-sm transition-all hover:bg-muted">
                <div className="flex-grow overflow-hidden mr-2">
                  <p className="font-medium truncate text-sm text-foreground">Recording-{video.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{video.date}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/20 transition-transform transform hover:scale-110">
                        <Play className="h-4 w-4 text-accent" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-0">
                      <DialogHeader className="p-4">
                        <DialogTitle>Playback: Recording-{video.id.slice(0, 8)}</DialogTitle>
                      </DialogHeader>
                      <video src={video.url} controls autoPlay className="w-full rounded-b-lg" />
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/20 transition-transform transform hover:scale-110">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your recorded video.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(video.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
