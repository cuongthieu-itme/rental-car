import {create} from "zustand";

interface RideBookingState {
    isOpen: boolean;
    rideData: {
        pickupLocation: string;
        dropoffLocation: string;
        pickupTime: Date;
    } | null;
    onOpen: (rideData: {
        pickupLocation: string;
        dropoffLocation: string;
        pickupTime: Date;
    }) => void;
    onClose: () => void;
}

export const useRideBooking = create<RideBookingState>((set) => ({
    isOpen: false,
    rideData: null,
    onOpen: (rideData) => set({isOpen: true, rideData}),
    onClose: () => set({isOpen: false, rideData: null}),
}));
