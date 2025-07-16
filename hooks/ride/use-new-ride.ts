import {create} from "zustand";

interface NewRideState {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useNewRide = create<NewRideState>((set) => ({
    isOpen: false,
    onOpen: () => set({isOpen: true}),
    onClose: () => set({isOpen: false}),
}));
