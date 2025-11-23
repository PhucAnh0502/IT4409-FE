import React from "react";
import { Users } from "lucide-react";

const SidebarSkeleton = () => {
    const skeletonContacts = Array(8).fill(null);

    return (
    <aside className="h-full w-full lg:w-80 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100">
        <div className="px-4 pt-5 pb-2">
            <div className="flex items-center justify-between mb-4">
                <div className="skeleton h-8 w-24 bg-base-300" /> 
                <div className="skeleton h-8 w-8 rounded-lg bg-base-300" /> 
            </div>

            <div className="skeleton h-10 w-full rounded-xl bg-base-300" />
        </div>

        <div className="overflow-y-auto w-full py-3">
            {skeletonContacts.map((_, idx) => (
                <div key={idx} className="w-full p-3 flex items-center gap-3">
                    <div className="skeleton size-12 rounded-full shrink-0 bg-base-300" />
                    <div className="text-left min-w-0 flex-1 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <div className="skeleton h-4 w-32 bg-base-300" />
                            <div className="skeleton h-3 w-10 bg-base-300" />
                        </div>           
                        <div className="skeleton h-3 w-1/2 bg-base-300" />
                    </div>
                </div>
            ))}
        </div>
    </aside>
    );
};

export default SidebarSkeleton;