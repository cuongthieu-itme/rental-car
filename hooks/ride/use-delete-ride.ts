import {create} from "zustand";

interface DeleteRideState {
    id?: string;
    isOpen: boolean;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useDeleteRide = create<DeleteRideState>((set) => ({
    id: undefined,
    isOpen: false,
    onOpen: (id: string) => set({isOpen: true, id}),
    onClose: () => set({isOpen: false, id: undefined}),
}));
