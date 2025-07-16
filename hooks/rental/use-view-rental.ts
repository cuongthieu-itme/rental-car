import {create} from "zustand";

interface ViewRentalState {
    id?: string;
    isOpen: boolean;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useViewRental = create<ViewRentalState>((set) => ({
    isOpen: false,
    onOpen: (id) => set({isOpen: true, id}),
    onClose: () => set({isOpen: false, id: undefined}),
}));
