import {create} from "zustand";

interface AddDriverState {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useAddDriver = create<AddDriverState>((set) => ({
    isOpen: false,
    onOpen: () => set({isOpen: true}),
    onClose: () => set({isOpen: false}),
}));
