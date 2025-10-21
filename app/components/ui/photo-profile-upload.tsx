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
    const [showFlash, setShowFlash] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const handTrackerRef = useRef<HandTracker | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastPoseTimeRef = useRef<number>(0);

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
                        const currentTime = Date.now();

                        console.log("Detected pose:", pose, "Detections:", detections.length);
                        setCurrentPose(pose);

                        // Debounce pose detection to avoid rapid changes
                        if (currentTime - lastPoseTimeRef.current < 200) {
                            return;
                        }
                        lastPoseTimeRef.current = currentTime;

                        // Update pose sequence with better logic
                        setPoseSequence(prev => {
                            let newSequence = [...prev];

                            // Only add pose if it's different from the last one
                            if (newSequence.length === 0 || newSequence[newSequence.length - 1] !== pose) {
                                newSequence.push(pose);
                            }

                            // Keep only last 3 poses
                            newSequence = newSequence.slice(-3);

                            console.log("Current sequence:", newSequence);

                            // Check for the correct sequence: 3, 2, 1
                            if (newSequence.length === 3 &&
                                newSequence[0] === 3 &&
                                newSequence[1] === 2 &&
                                newSequence[2] === 1) {

                                console.log("✅ Sequence completed! Starting countdown...");

                                // Mark all poses as completed
                                setCompletedPoses([3, 2, 1]);

                                // Start countdown
                                startCountdown();

                                // Reset sequence
                                return [];
                            }

                            // Update completed poses based on sequence progression
                            setCompletedPoses(prevCompleted => {
                                const newCompleted = [...prevCompleted];

                                // Check each position in the sequence
                                if (newSequence.length >= 1 && newSequence[0] === 3 && !newCompleted.includes(3)) {
                                    newCompleted.push(3);
                                    console.log("✅ Completed pose 3");
                                }
                                if (newSequence.length >= 2 && newSequence[1] === 2 && !newCompleted.includes(2)) {
                                    newCompleted.push(2);
                                    console.log("✅ Completed pose 2");
                                }
                                if (newSequence.length >= 3 && newSequence[2] === 1 && !newCompleted.includes(1)) {
                                    newCompleted.push(1);
                                    console.log("✅ Completed pose 1");
                                }

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

        // Clear any existing countdown
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
        }

        setCountdown(3);
        countdownIntervalRef.current = setInterval(() => {
            setCountdown(prev => {
                console.log("Countdown:", prev);
                if (prev === null || prev <= 0) {
                    if (countdownIntervalRef.current) {
                        clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                    }
                    console.log("Countdown finished, capturing photo...");
                    capturePhoto();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const capturePhoto = () => {
        console.log("📸 capturePhoto called");

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

        // Check if video is ready and playing
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.error("Video dimensions not ready:", video.videoWidth, video.videoHeight);
            return;
        }

        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            console.error("Video not ready to capture");
            return;
        }

        console.log("Capturing photo with dimensions:", video.videoWidth, "x", video.videoHeight);

        // Show flash effect
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 200);

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas (mirror the image for selfie effect)
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        console.log("Captured image data length:", imageData.length);

        if (imageData && imageData.length > 100) {
            setCapturedImage(imageData);
            console.log("✅ Image captured successfully");

            // Stop hand tracking and camera AFTER a small delay to ensure image is set
            setTimeout(() => {
                if (handTrackerRef.current) {
                    handTrackerRef.current.stopTracking();
                }

                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
            }, 100);
        } else {
            console.error("Failed to capture image - data too small");
        }
    };

    const stopCamera = () => {
        // Clear countdown interval
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }

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
        setShowFlash(false);
        lastPoseTimeRef.current = 0;
    };

    const savePhoto = () => {
        if (capturedImage) {
            onChange(capturedImage);
            setCapturedImage(null);
            stopCamera();
        }
    };

    const retakePhoto = async () => {
        setCapturedImage(null);
        setCurrentPose(0);
        setPoseSequence([]);
        setCompletedPoses([]);

        // Restart camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
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

                // Restart hand tracking
                if (handTrackerRef.current && videoRef.current) {
                    handTrackerRef.current.startTracking(videoRef.current, (detections: HandDetection[]) => {
                        const pose = detectHandPose(detections);
                        const currentTime = Date.now();

                        console.log("Detected pose:", pose, "Detections:", detections.length);
                        setCurrentPose(pose);

                        // Debounce pose detection to avoid rapid changes
                        if (currentTime - lastPoseTimeRef.current < 200) {
                            return;
                        }
                        lastPoseTimeRef.current = currentTime;

                        // Update pose sequence with better logic
                        setPoseSequence(prev => {
                            let newSequence = [...prev];

                            // Only add pose if it's different from the last one
                            if (newSequence.length === 0 || newSequence[newSequence.length - 1] !== pose) {
                                newSequence.push(pose);
                            }

                            // Keep only last 3 poses
                            newSequence = newSequence.slice(-3);

                            console.log("Current sequence:", newSequence);

                            // Check for the correct sequence: 3, 2, 1
                            if (newSequence.length === 3 &&
                                newSequence[0] === 3 &&
                                newSequence[1] === 2 &&
                                newSequence[2] === 1) {

                                console.log("✅ Sequence completed! Starting countdown...");

                                // Mark all poses as completed
                                setCompletedPoses([3, 2, 1]);

                                // Start countdown
                                startCountdown();

                                // Reset sequence
                                return [];
                            }

                            // Update completed poses based on sequence progression
                            setCompletedPoses(prevCompleted => {
                                const newCompleted = [...prevCompleted];

                                // Check each position in the sequence
                                if (newSequence.length >= 1 && newSequence[0] === 3 && !newCompleted.includes(3)) {
                                    newCompleted.push(3);
                                    console.log("✅ Completed pose 3");
                                }
                                if (newSequence.length >= 2 && newSequence[1] === 2 && !newCompleted.includes(2)) {
                                    newCompleted.push(2);
                                    console.log("✅ Completed pose 2");
                                }
                                if (newSequence.length >= 3 && newSequence[2] === 1 && !newCompleted.includes(1)) {
                                    newCompleted.push(1);
                                    console.log("✅ Completed pose 1");
                                }

                                return newCompleted;
                            });

                            return newSequence;
                        });
                    });
                }
            }
        } catch (error) {
            console.error("Error restarting camera:", error);
            alert("Unable to restart camera. Please try again.");
        }
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
            // Clear countdown interval
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }

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
                    <div className="fixed inset-0 bg-neutral-100/50 flex items-center justify-center z-50">
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
                                {/* Show captured image preview OR video feed */}
                                {capturedImage ? (
                                    /* Captured Image Preview */
                                    <div className="flex flex-col gap-4 pb-9">
                                        <div className="relative w-full h-[400px] bg-neutral-20 rounded-lg overflow-hidden">
                                            <img
                                                src={capturedImage}
                                                alt="Captured"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 justify-center">
                                            <Button
                                                type="button"
                                                size={"sm"}
                                                variant="outline"
                                                onClick={retakePhoto}
                                                className="text-m-bold"
                                            >
                                                Retake photo
                                            </Button>
                                            <Button
                                                type="button"
                                                size={"sm"}
                                                onClick={savePhoto}
                                                className="text-m-bold"
                                            >
                                                Submit
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Video Feed with Hand Tracking */
                                    <div className="flex flex-col items-center gap-4">
                                        {/* Video Feed */}
                                        <div className="relative w-full h-[400px] bg-neutral-20 rounded-lg overflow-hidden">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover scale-x-[-1]"
                                            />

                                            {/* Camera Flash Effect */}
                                            {showFlash && (
                                                <div className="absolute inset-0 bg-white animate-pulse"></div>
                                            )}

                                            {/* Pose Indicator */}
                                            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-s-bold">
                                                Current: {currentPose === 0 ? 'No hand' : `${currentPose} finger${currentPose > 1 ? 's' : ''}`}
                                            </div>

                                            {/* Countdown */}
                                            {countdown && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <p className="text-m-bold text-white">
                                                            Capturing photo in
                                                        </p>
                                                        <span className="text-5xl font-bold text-white">
                                                            {countdown}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Manual Capture Button for Testing
                                            <div className="absolute bottom-4 right-4">
                                                <Button
                                                    type="button"
                                                    onClick={capturePhoto}
                                                    className="bg-success-main text-white px-4 py-2 rounded"
                                                >
                                                    📸 Manual Capture
                                                </Button>
                                            </div> */}
                                        </div>

                                        {/* Instructions */}
                                        <div className="text-start w-full">
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
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Take Picture Button */}
                {!isCapturing && (
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
