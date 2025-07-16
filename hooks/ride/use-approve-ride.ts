import {create} from "zustand";

interface ApproveRideState {
    isOpen: boolean;
    id: string;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useApproveRide = create<ApproveRideState>((set) => ({
    isOpen: false,
    id: "",
    onOpen: (id) => set({isOpen: true, id}),
    onClose: () => set({isOpen: false, id: ""}),
}));
