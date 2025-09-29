import { JSX } from "react";


export default function TopBar({ section }: { section: string }): JSX.Element {
    return (
        <div className="sticky top-0 z-10 bg-white px-6 py-4 flex items-center justify-between">
            {/* Left-aligned title */}
            <div>
                <h2 className="text-sm text-gray-500">Good Morning</h2>
                <h1 className="text-2xl font-bold">{section}</h1>
            </div>

            {/* Profile picture on the right */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                <img
                    src="https://randomuser.me/api/portraits/men/75.jpg"
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
}
