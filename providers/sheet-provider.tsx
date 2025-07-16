"use client";
import AddCarSheet from "@/screens/cars/components/AddCarSheet";
import UpdateCarSheet from "@/screens/cars/components/UpdateCarSheet";
import ViewCarSheet from "@/screens/cars/components/ViewCarSheet";

export const SheetProvider = () => {
    return (
        <>
            <AddCarSheet />
            <UpdateCarSheet />
            <ViewCarSheet />
        </>
    );
};
