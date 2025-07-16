import {create} from "zustand";

interface ViewCarState {
    id?: string;
    isOpen: boolean;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useViewCar = create<ViewCarState>((set) => ({
    isOpen: false,
    onOpen: (id) => set({isOpen: true, id}),
    onClose: () => set({isOpen: false, id: undefined}),
}));
