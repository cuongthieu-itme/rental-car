import {create} from "zustand";

interface RejectRideState {
    isOpen: boolean;
    id: string;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useRejectRide = create<RejectRideState>((set) => ({
    isOpen: false,
    id: "",
    onOpen: (id) => set({isOpen: true, id}),
    onClose: () => set({isOpen: false, id: ""}),
}));
