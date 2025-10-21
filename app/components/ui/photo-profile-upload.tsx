import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { ArrowUpTrayIcon, CameraIcon, XMarkIcon, CheckIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { HandTracker, detectHandPose, type HandPose, type HandDetection } from "~/utils/handTracking";

interface PhotoProfileUploadProps {
    value?: string;
    onChange: (value: string) => void;
    error?: string;
}

export function PhotoProfileUpload({ value, onChange, error }: PhotoProfileUploadProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [currentPose, setCurrentPose] = useState<HandPose>(0);
    const [poseSequence, setPoseSequence] = useState<HandPose[]>([]);
    const [completedPoses, setCompletedPoses] = useState<HandPose[]>([]);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const handTrackerRef = useRef<HandTracker | null>(null);

    // Initialize hand tracker
    const initializeHandTracker = async () => {
        if (handTrackerRef.current) return;

        setIsInitializing(true);
        try {
            const tracker = new HandTracker();
            await tracker.initialize();
            handTrackerRef.current = tracker;
        } catch (error) {
            console.error("Failed to initialize hand tracker:", error);
            throw error;
        } finally {
            setIsInitializing(false);
        }
    };

    const startCamera = async () => {
        try {
            setIsCapturing(true);
            setPoseSequence([]);
            setCompletedPoses([]);
            setCurrentPose(0);

            // Initialize hand tracker first
            await initializeHandTracker();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user' // Front camera
                }
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // Wait for video to be ready
                await new Promise((resolve) => {
                    if (videoRef.current) {
                        videoRef.current.onloadedmetadata = resolve;
                    }
                });

                // Start hand tracking
                if (handTrackerRef.current && videoRef.current) {
                    handTrackerRef.current.startTracking(videoRef.current, (detections: HandDetection[]) => {
                        const pose = detectHandPose(detections);
                        console.log("Detected pose:", pose, "Detections:", detections.length);
                        setCurrentPose(pose);

                        // Update pose sequence
                        setPoseSequence(prev => {
                            const newSequence = [...prev, pose].slice(-3); // Keep last 3 poses

                            // Check if we have the sequence: 3, 2, 1 (counting down)
                            if (newSequence.length === 3 &&
                                newSequence[0] === 3 &&
                                newSequence[1] === 2 &&
                                newSequence[2] === 1) {

                                console.log("Sequence completed! Starting countdown...");

                                // Mark all poses as completed
                                setCompletedPoses([3, 2, 1]);

                                // Start countdown
                                startCountdown();
                                return [];
                            }

                            // Update completed poses based on current sequence progression
                            setCompletedPoses(prevCompleted => {
                                const newCompleted = [...prevCompleted];

                                // Add poses as they are completed in sequence
                                if (newSequence.length >= 1 && newSequence[0] === 3 && !newCompleted.includes(3)) {
                                    newCompleted.push(3);
                                }
                                if (newSequence.length >= 2 && newSequence[1] === 2 && !newCompleted.includes(2)) {
                                    newCompleted.push(2);
                                }
                                if (newSequence.length >= 3 && newSequence[2] === 1 && !newCompleted.includes(1)) {
                                    newCompleted.push(1);
                                }

                                console.log("newCompleted", newCompleted);
                                return newCompleted;
                            });

                            return newSequence;
                        });
                    });
                }
            }

        } catch (error) {
            console.error("Error accessing camera:", error);
            alert("Unable to access camera. Please check permissions.");
            setIsCapturing(false);
        }
    };


    const startCountdown = () => {
        console.log("Starting countdown...");
        setCountdown(3);
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                console.log("Countdown:", prev);
                if (prev === null || prev <= 1) {
                    clearInterval(countdownInterval);
                    console.log("Countdown finished, capturing photo...");
                    capturePhoto();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) {
            console.error("Video or canvas ref not available");
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            console.error("Canvas context not available");
            return;
        }

        // Check if video is ready
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.error("Video dimensions not ready:", video.videoWidth, video.videoHeight);
            return;
        }

        console.log("Capturing photo with dimensions:", video.videoWidth, "x", video.videoHeight);

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        console.log("Captured image data length:", imageData.length);

        setCapturedImage(imageData);

        // Stop camera
        stopCamera();
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (handTrackerRef.current) {
            handTrackerRef.current.stopTracking();
        }

        setIsCapturing(false);
        setCurrentPose(0);
        setPoseSequence([]);
        setCompletedPoses([]);
        setCountdown(null);
    };

    const savePhoto = () => {
        if (capturedImage) {
            onChange(capturedImage);
            setCapturedImage(null);
        }
    };

    const cancelCapture = () => {
        setCapturedImage(null);
        stopCamera();
    };

    const handleTakePicture = async () => {
        setIsLoading(true);
        try {
            await startCamera();
        } catch (error) {
            console.error("Error starting camera:", error);
            alert("Failed to start camera. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
            if (handTrackerRef.current) {
                handTrackerRef.current.destroy();
                handTrackerRef.current = null;
            }
        };
    }, []);

    return (
        <div className="space-y-2">
            <label className="text-s-bold text-neutral-100">
                Photo Profile
            </label>

            <div className="flex flex-col items-start gap-2">
                {/* Avatar Display */}
                <div className="relative rounded-2xl size-32 overflow-hidden border border-neutral-40">
                    {capturedImage ? (
                        <img
                            src={capturedImage}
                            alt="Captured Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : value ? (
                        <img
                            src={value}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-neutral-20 flex items-center justify-center">
                            <CameraIcon className="size-8 text-neutral-60" />
                        </div>
                    )}
                </div>

                {/* Camera Interface */}
                {isCapturing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-[10px] shadow-modal w-full max-w-[600px] mx-4 overflow-hidden">
                            {/* Header */}
                            <div className="bg-white px-6 py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl-bold text-neutral-100 mb-1">
                                            Raise Your Hand to Capture
                                        </h3>
                                        <p className="text-s-regular text-neutral-100">
                                            We'll take the photo once your hand pose is detected.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={stopCamera}
                                        className="size-6 flex items-center justify-center hover:bg-neutral-20 rounded"
                                    >
                                        <XMarkIcon className="w-6 h-6 text-neutral-100 stroke-2" />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="px-6 pb-6">
                                <div className="flex flex-col items-center gap-4">
                                    {/* Video Feed */}
                                    <div className="relative w-full h-[400px] bg-neutral-20 rounded-lg overflow-hidden">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Pose Indicator */}
                                        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-s-bold">
                                            Current: {currentPose === 0 ? 'No hand' : `${currentPose} finger${currentPose > 1 ? 's' : ''}`}
                                        </div>

                                        {/* Countdown */}
                                        {countdown && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                                <div className="text-6xl font-bold text-white">
                                                    {countdown}
                                                </div>
                                            </div>
                                        )}

                                        {/* Manual Capture Button for Testing */}
                                        <div className="absolute bottom-4 right-4">
                                            <Button
                                                type="button"
                                                onClick={capturePhoto}
                                                className="bg-success-main text-white px-4 py-2 rounded"
                                            >
                                                📸 Manual Capture
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="text-start">
                                        <p className="text-s-regular text-neutral-100">
                                            To take a picture, follow the hand poses in the order shown below. The system will automatically capture the image once the final pose is detected.
                                        </p>
                                    </div>

                                    {/* Hand Pose Sequence */}
                                    <div className="flex items-center gap-2">
                                        {[
                                            { pose: 3, icon: "/hand_gesture_3.svg", successIcon: "/hand_gesture_3_sucess.svg" },
                                            { pose: 2, icon: "/hand_gesture_2.svg", successIcon: "/hand_gesture_2_sucess.svg" },
                                            { pose: 1, icon: "/hand_gesture_1.svg", successIcon: "/hand_gesture_1_sucess.svg" },
                                        ].map((item, index) => (
                                            <div key={item.pose} className="flex items-center">
                                                {/* Hand Pose Icon */}
                                                <div className={`size-14 rounded-lg flex items-center justify-center ${completedPoses.includes(item.pose as HandPose)
                                                    ? 'bg-success-surface border border-success-border'
                                                    : 'bg-neutral-40'
                                                    }`}>
                                                    <img
                                                        src={completedPoses.includes(item.pose as HandPose) ? item.successIcon : item.icon}
                                                        alt={`Hand gesture ${item.pose}`}
                                                        className={`w-full h-full object-contain p-1 ${completedPoses.includes(item.pose as HandPose)
                                                            ? 'stroke-success-main'
                                                            : 'stroke-neutral-70'
                                                            }`}
                                                    />
                                                </div>

                                                {/* Arrow (except for last item) */}
                                                {index < 2 && (
                                                    <div className="mx-2">
                                                        <ChevronRightIcon className="size-6 stroke-2 text-neutral-100" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Preview and Save */}
                {capturedImage && !isCapturing && (
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={cancelCapture}
                            className="flex items-center gap-1"
                        >
                            <XMarkIcon className="size-4" />
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={savePhoto}
                            className="flex items-center gap-1"
                        >
                            <CheckIcon className="size-4" />
                            Save Photo
                        </Button>
                    </div>
                )}

                {/* Take Picture Button */}
                {!isCapturing && !capturedImage && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleTakePicture}
                        disabled={isLoading || isInitializing}
                        className="flex items-center gap-1 !text-m-bold text-neutral-100"
                    >
                        <ArrowUpTrayIcon className="size-4 stroke-3 text-neutral-100" />
                        {isLoading || isInitializing ? "Initializing..." : "Take Picture with Gesture"}
                    </Button>
                )}

                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {error && (
                <p className="text-s-regular text-danger-main">{error}</p>
            )}
        </div>
    );
}
