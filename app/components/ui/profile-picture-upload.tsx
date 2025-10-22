import { useState, useRef, useCallback } from "react";
import { CameraIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/toast";

interface ProfilePictureUploadProps {
    onImageCapture: (imageData: string) => void;
    currentImage?: string;
    disabled?: boolean;
}

export function ProfilePictureUpload({ onImageCapture, currentImage, disabled }: ProfilePictureUploadProps) {
    const [isCapturing, setIsCapturing] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            toast.error({
                title: "Camera access denied",
                description: "Please allow camera access to take a profile picture."
            });
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCapturing(false);
    }, [stream]);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        stopCamera();
        onImageCapture(imageData);

        toast.success({
            title: "Photo captured successfully",
            description: "Your profile picture has been updated."
        });
    }, [stopCamera, onImageCapture]);

    const handleGestureCapture = useCallback(() => {
        capturePhoto();
    }, [capturePhoto]);

    const removeImage = useCallback(() => {
        onImageCapture('');
        toast.success({
            title: "Photo removed",
            description: "Your profile picture has been removed."
        });
    }, [onImageCapture]);

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="text-m-bold text-neutral-70 mb-2">Profile Picture</h3>
                <p className="text-s-regular text-neutral-60 mb-4">
                    Take a photo using hand gesture or camera
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

            {/* Camera Preview */}
            {isCapturing && (
                <div className="relative mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-primary-main">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-white rounded-full animate-pulse"></div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 items-center">
                {!isCapturing ? (
                    <>
                        <Button
                            onClick={startCamera}
                            disabled={disabled}
                            className="w-full max-w-xs"
                        >
                            <CameraIcon className="w-5 h-5 mr-2" />
                            Open Camera
                        </Button>

                        <Button
                            onClick={handleGestureCapture}
                            disabled={disabled}
                            variant="outline"
                            className="w-full max-w-xs"
                        >
                            <PhotoIcon className="w-5 h-5 mr-2" />
                            Capture with Hand Gesture
                        </Button>
                    </>
                ) : (
                    <div className="flex gap-3 w-full max-w-xs">
                        <Button
                            onClick={capturePhoto}
                            className="flex-1"
                        >
                            <CameraIcon className="w-5 h-5 mr-2" />
                            Capture Photo
                        </Button>
                        <Button
                            onClick={stopCamera}
                            variant="outline"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Hand Gesture Instructions */}
            {!isCapturing && (
                <div className="bg-primary-light/10 border border-primary-main/20 rounded-lg p-4">
                    <h4 className="text-s-bold text-primary-main mb-2">Hand Gesture Instructions:</h4>
                    <ul className="text-s-regular text-neutral-70 space-y-1">
                        <li>• Raise your hand to start gesture detection</li>
                        <li>• Make a "V" sign with your fingers to capture</li>
                        <li>• Wave your hand to cancel</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
