
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import * as faceapi from "face-api.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import type { RecordedVideo } from "@/app/page";
import { Camera, Video, VideoOff, Loader2 } from "lucide-react";

interface FaceTrackerProps {
  onNewVideo: (video: RecordedVideo) => void;
}

export function FaceTracker({ onNewVideo }: FaceTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationFrameId = useRef<number>();

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models: ", error);
        toast({ title: "Error", description: "Failed to load face detection models.", variant: "destructive" });
      }
    };
    loadModels();
  }, [toast]);
  
  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        console.error('Camera API not supported in this browser');
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Unsupported Browser',
          description: 'Your browser does not support camera access.',
        });
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
      }
    };
  }, [toast]);

  const detectAndDraw = useCallback(async () => {
    if (videoRef.current && !videoRef.current.paused && canvasRef.current && hasCameraPermission && modelsLoaded) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animationFrameId.current = requestAnimationFrame(detectAndDraw);
        return;
      };

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const detection = await faceapi.detectSingleFace(video, new faceapi.SsdMobilenetv1Options());

      if (detection) {
        setFaceDetected(true);
        const resizedDetection = faceapi.resizeResults(detection, displaySize);
        const { x, y, width, height } = resizedDetection.box;
        
        ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
        ctx.lineWidth = 4;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, width, height);
        ctx.shadowColor = "rgba(255, 0, 0, 0.5)";
        ctx.shadowBlur = 15;
        ctx.setLineDash([]);
        
      } else {
        setFaceDetected(false);
      }
    }
    animationFrameId.current = requestAnimationFrame(detectAndDraw);
  }, [hasCameraPermission, modelsLoaded]);
  
  const handleVideoPlay = () => {
    if (modelsLoaded) {
      detectAndDraw();
    }
  };
  
  const handleStartRecording = () => {
    if (canvasRef.current && videoRef.current?.srcObject && modelsLoaded) {
      setIsRecording(true);
      const canvasStream = canvasRef.current.captureStream(30);
      const videoStream = videoRef.current.srcObject as MediaStream;
      const audioTrack = videoStream.getAudioTracks()[0];
      if (audioTrack) {
        canvasStream.addTrack(audioTrack.clone());
      }
      
      mediaRecorderRef.current = new MediaRecorder(canvasStream, { mimeType: "video/webm" });
      const chunks: Blob[] = [];
      mediaRecorderRef.current.ondataavailable = (event) => chunks.push(event.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        onNewVideo({
          id: new Date().toISOString(),
          url,
          date: new Date().toLocaleString(),
        });
        toast({ title: "Recording Saved", description: "Your video has been saved locally." });
      };
      mediaRecorderRef.current.start();
    } else {
         toast({ title: "Models not ready", description: "Please wait for the models to load before recording.", variant: "destructive" });
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };
  
  const isLoading = !modelsLoaded || hasCameraPermission === null;

  return (
    <Card className="overflow-hidden shadow-lg transition-all hover:shadow-xl">
      <CardContent className="p-0 relative aspect-video bg-black">
        <video
          ref={videoRef}
          onPlay={handleVideoPlay}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-500 transform -scale-x-100 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        ></video>
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full transform -scale-x-100" />

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-secondary-foreground bg-background">
            <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
            <p className="font-medium">Initializing camera & models...</p>
            <p className="text-xs text-muted-foreground mt-2">Please allow camera access.</p>
          </div>
        )}
        
        {hasCameraPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-secondary-foreground bg-background p-4">
                <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access in your browser settings to use this feature. You may need to refresh the page after granting permission.
                    </AlertDescription>
                </Alert>
            </div>
        )}

      </CardContent>
      <CardFooter className="p-4 bg-card flex-col items-center gap-4">
        <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            {faceDetected ? (
                <><Camera className="h-4 w-4 text-destructive" /><span>Face Detected</span></>
            ) : (
                <><Camera className="h-4 w-4" /><span>Searching for face...</span></>
            )}
            </div>
            <Button onClick={isRecording ? handleStopRecording : handleStartRecording} disabled={isLoading || !hasCameraPermission} variant={isRecording ? "destructive" : "default"} className="w-44 transition-all duration-300 transform hover:scale-105">
            {isRecording ? <VideoOff className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
            {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
            Note: It may take a moment to start recording as the face is analyzed. Please wait a few seconds after pressing the button.
        </p>
      </CardFooter>
    </Card>
  );
}
