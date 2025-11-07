
export interface UserLocation {
    latitude: number;
    longitude: number;
    accuracy: number;
}

export enum FenceStatus {
    INSIDE = 'Inside',
    OUTSIDE = 'Outside',
    UNKNOWN = 'Unknown'
}

export interface GeoFence {
    id: string;
    name: string;
    lat: number;
    lon: number;
    radius: number; // in meters
    status: FenceStatus;
}

export interface NotificationEvent {
    id: string;
    fenceId: string;
    fenceName: string;
    type: 'enter' | 'exit';
    timestamp: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    picture: string;
}
