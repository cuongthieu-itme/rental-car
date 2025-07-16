import {create} from "zustand";

interface ViewRideState {
    id?: string;
    isOpen: boolean;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useViewRide = create<ViewRideState>((set) => ({
    id: undefined,
    isOpen: false,
    onOpen: (id: string) => set({isOpen: true, id}),
    onClose: () => set({isOpen: false, id: undefined}),
}));
