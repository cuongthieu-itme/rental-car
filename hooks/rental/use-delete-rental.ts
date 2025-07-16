import {create} from "zustand";

interface DeleteRentalState {
    id?: string;
    isOpen: boolean;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useDeleteRental = create<DeleteRentalState>((set) => ({
    isOpen: false,
    onOpen: (id) => set({isOpen: true, id}),
    onClose: () => set({isOpen: false, id: undefined}),
}));
