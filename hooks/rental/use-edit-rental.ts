import {create} from "zustand";

interface EditRentalState {
    id?: string;
    isOpen: boolean;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useEditRental = create<EditRentalState>((set) => ({
    isOpen: false,
    onOpen: (id) => set({isOpen: true, id}),
    onClose: () => set({isOpen: false, id: undefined}),
}));
