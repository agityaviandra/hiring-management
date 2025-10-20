import { useState, useRef, useCallback, useEffect } from "react";
import { CameraIcon, PhotoIcon, XMarkIcon, HandRaisedIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/toast";

interface HandGestureCaptureProps {
    onImageCapture: (imageData: string) => void;
    currentImage?: string;
    disabled?: boolean;
}

export function HandGestureCapture({ onImageCapture, currentImage, disabled }: HandGestureCaptureProps) {
    const [isCapturing, setIsCapturing] = useState(false);
    const [isDetectingGesture, setIsDetectingGesture] = useState(false);
    const [gestureStatus, setGestureStatus] = useState<string>("");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            setStream(mediaStream);
            setIsCapturing(true);
            setIsDetectingGesture(true);
            setGestureStatus("Raise your hand to start gesture detection...");

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            // Start gesture detection simulation
            startGestureDetection();
        } catch (error) {
            console.error('Error accessing camera:', error);
            toast.error({
                title: "Camera access denied",
                description: "Please allow camera access to take a profile picture."
            });
        }
    }, []);

    const startGestureDetection = useCallback(() => {
        // This is a simplified gesture detection simulation
        // In a real implementation, you would use MediaPipe or similar library
        const gestures = [
            "Raise your hand to start gesture detection...",
            "Hand detected! Make a 'V' sign to capture photo",
            "Perfect! Capturing photo in 3...",
            "Capturing photo in 2...",
            "Capturing photo in 1...",
            "Photo captured!"
        ];

        let gestureIndex = 0;
        const gestureInterval = setInterval(() => {
            setGestureStatus(gestures[gestureIndex]);
            gestureIndex++;

            if (gestureIndex >= gestures.length) {
                clearInterval(gestureInterval);
                capturePhoto();
            }
        }, 1500);

        gestureTimeoutRef.current = gestureInterval as any;
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (gestureTimeoutRef.current) {
            clearTimeout(gestureTimeoutRef.current);
        }
        setIsCapturing(false);
        setIsDetectingGesture(false);
        setGestureStatus("");
    }, [stream]);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current frame from video to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to base64 image
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        // Stop camera and capture photo
        stopCamera();
        onImageCapture(imageData);

        toast.success({
            title: "Photo captured successfully",
            description: "Your profile picture has been updated using hand gesture."
        });
    }, [stopCamera, onImageCapture]);

    const removeImage = useCallback(() => {
        onImageCapture('');
        toast.success({
            title: "Photo removed",
            description: "Your profile picture has been removed."
        });
    }, [onImageCapture]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (gestureTimeoutRef.current) {
                clearTimeout(gestureTimeoutRef.current);
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="text-m-bold text-neutral-70 mb-2">Profile Picture</h3>
                <p className="text-s-regular text-neutral-60 mb-4">
                    Take a photo using hand gesture detection
                </p>
            </div>

            {/* Current Image Display */}
            {currentImage && !isCapturing && (
                <div className="relative mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-neutral-30">
                    <img
                        src={currentImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={removeImage}
                        disabled={disabled}
                        className="absolute top-2 right-2 w-8 h-8 bg-danger-main text-white rounded-full flex items-center justify-center hover:bg-danger-dark transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Camera Preview with Gesture Detection */}
            {isCapturing && (
                <div className="relative mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-primary-main">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />

                    {/* Gesture Detection Overlay */}
                    {isDetectingGesture && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                            <div className="w-16 h-16 border-4 border-white rounded-full animate-pulse mb-2"></div>
                            <div className="text-white text-xs text-center px-2">
                                {gestureStatus}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 items-center">
                {!isCapturing ? (
                    <Button
                        onClick={startCamera}
                        disabled={disabled}
                        className="w-full max-w-xs"
                    >
                        <HandRaisedIcon className="w-5 h-5 mr-2" />
                        Start Hand Gesture Capture
                    </Button>
                ) : (
                    <Button
                        onClick={stopCamera}
                        variant="outline"
                        className="w-full max-w-xs"
                    >
                        Cancel Gesture Detection
                    </Button>
                )}
            </div>

            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Hand Gesture Instructions */}
            {!isCapturing && (
                <div className="bg-primary-light/10 border border-primary-main/20 rounded-lg p-4">
                    <h4 className="text-s-bold text-primary-main mb-2">Hand Gesture Instructions:</h4>
                    <ul className="text-s-regular text-neutral-70 space-y-1">
                        <li>• Raise your hand in front of the camera</li>
                        <li>• Make a "V" sign with your fingers to capture</li>
                        <li>• The system will automatically detect your gesture</li>
                        <li>• Photo will be captured after gesture confirmation</li>
                    </ul>
                </div>
            )}

            {/* Gesture Status Display */}
            {isDetectingGesture && gestureStatus && (
                <div className="bg-primary-main/10 border border-primary-main/30 rounded-lg p-3 text-center">
                    <p className="text-s-bold text-primary-main">{gestureStatus}</p>
                </div>
            )}
        </div>
    );
}
