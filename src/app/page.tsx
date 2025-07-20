"use client";

import { useState, useEffect } from "react";
import { FaceTracker } from "@/components/face-tracker";
import { VideoList } from "@/components/video-list";
import { Video } from 'lucide-react';

export interface RecordedVideo {
  id: string;
  url: string;
  date: string;
}

export default function Home() {
  const [videos, setVideos] = useState<RecordedVideo[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedVideos = localStorage.getItem("recorded-videos");
      if (savedVideos) {
        setVideos(JSON.parse(savedVideos));
      }
    } catch (error) {
      console.error("Could not load videos from local storage", error);
    }
  }, []);

  const handleNewVideo = (video: RecordedVideo) => {
    setVideos((prevVideos) => {
      const newVideos = [video, ...prevVideos];
      if (isClient) {
        try {
          localStorage.setItem("recorded-videos", JSON.stringify(newVideos));
        } catch (error) {
          console.error("Could not save video to local storage", error);
        }
      }
      return newVideos;
    });
  };

  const handleDeleteVideo = (id: string) => {
    setVideos((prevVideos) => {
      const newVideos = prevVideos.filter((v) => v.id !== id);
      if (isClient) {
        try {
          localStorage.setItem("recorded-videos", JSON.stringify(newVideos));
        } catch (error) {
           console.error("Could not update local storage", error);
        }
      }
      return newVideos;
    });
  };
  
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body flex flex-col">
      <header className="py-4 px-4 md:px-8 border-b shadow-sm">
        <div className="container mx-auto flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Video className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-headline text-foreground">
            Visage Recorder
          </h1>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8 grid gap-8 lg:grid-cols-3 flex-grow">
        <div className="lg:col-span-2">
            <FaceTracker onNewVideo={handleNewVideo} />
        </div>
        <div className="lg:col-span-1">
            <VideoList videos={videos} onDelete={handleDeleteVideo} />
        </div>
      </main>
      <footer className="text-center p-4 border-t text-muted-foreground text-sm">
        <p>Developed by Rishabh Dev.</p>
        <div className="flex justify-center items-center gap-4 mt-1">
          <a href="https://x.com/itxrishabh" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            X Bio: @itxrishabh
          </a>
          <span>Contact: @itxrishabh</span>
        </div>
      </footer>
    </div>
  );
}
