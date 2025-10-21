import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export interface HandLandmark {
    x: number;
    y: number;
    z: number;
}

export interface HandDetection {
    landmarks: HandLandmark[];
    handedness: 'Left' | 'Right';
}

export type HandPose = 0 | 1 | 2 | 3; // 0 = no hand, 1-3 = finger count

export class HandTracker {
    private hands: Hands;
    private camera: Camera | null = null;
    private onResults: ((results: HandDetection[]) => void) | null = null;
    private isInitialized = false;

    constructor() {
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults((results) => {
            if (this.onResults) {
                const detections: HandDetection[] = [];

                if (results.multiHandLandmarks && results.multiHandedness) {
                    for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                        const landmarks = results.multiHandLandmarks[i];
                        const handedness = results.multiHandedness[i];

                        detections.push({
                            landmarks: landmarks.map(landmark => ({
                                x: landmark.x,
                                y: landmark.y,
                                z: landmark.z
                            })),
                            handedness: handedness.label as 'Left' | 'Right'
                        });
                    }
                }

                this.onResults(detections);
            }
        });
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            await this.hands.initialize();
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize MediaPipe Hands:', error);
            throw error;
        }
    }

    startTracking(videoElement: HTMLVideoElement, onResults: (results: HandDetection[]) => void): void {
        if (!this.isInitialized) {
            throw new Error('HandTracker not initialized. Call initialize() first.');
        }

        this.onResults = onResults;

        this.camera = new Camera(videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });

        this.camera.start();
    }

    stopTracking(): void {
        if (this.camera) {
            this.camera.stop();
            this.camera = null;
        }
        this.onResults = null;
    }

    destroy(): void {
        this.stopTracking();
        if (this.hands) {
            this.hands.close();
        }
    }
}

// Utility function to count extended fingers
export function countExtendedFingers(landmarks: HandLandmark[]): number {
    if (landmarks.length < 21) return 0;

    // Hand landmark indices
    const FINGER_TIPS = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky
    const FINGER_PIPS = [3, 6, 10, 14, 18]; // Proximal Interphalangeal Joints

    let extendedCount = 0;

    // Check each finger
    for (let i = 0; i < FINGER_TIPS.length; i++) {
        const tip = landmarks[FINGER_TIPS[i]];
        const pip = landmarks[FINGER_PIPS[i]];

        // For thumb, check horizontal position
        if (i === 0) { // Thumb
            if (tip.x > pip.x) {
                extendedCount++;
            }
        } else { // Other fingers, check vertical position
            if (tip.y < pip.y) {
                extendedCount++;
            }
        }
    }

    return extendedCount;
}

// Convert finger count to HandPose
export function fingerCountToHandPose(fingerCount: number): HandPose {
    if (fingerCount === 0) return 0;
    if (fingerCount >= 1 && fingerCount <= 3) return fingerCount as HandPose;
    return 0; // Default to no hand for other counts
}

// Detect hand pose from MediaPipe results
export function detectHandPose(detections: HandDetection[]): HandPose {
    if (detections.length === 0) return 0;

    // Use the first detected hand
    const hand = detections[0];
    const fingerCount = countExtendedFingers(hand.landmarks);

    return fingerCountToHandPose(fingerCount);
}
