import {create} from "zustand";

interface EditRideState {
    id?: string;
    isOpen: boolean;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useEditRide = create<EditRideState>((set) => ({
    id: undefined,
    isOpen: false,
    onOpen: (id: string) => set({isOpen: true, id}),
    onClose: () => set({isOpen: false, id: undefined}),
}));
