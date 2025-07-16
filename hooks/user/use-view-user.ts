import {create} from "zustand";

interface ViewUserState {
    id?: string;
    isOpen: boolean;
    onOpen: (id: string) => void;
    onClose: () => void;
}

export const useViewUser = create<ViewUserState>((set) => ({
    isOpen: false,
    onOpen: (id) => set({isOpen: true, id}),
    onClose: () => set({isOpen: false, id: undefined}),
}));
