// src/components/InputField.jsx
import React from "react";
import "../index.css";

interface InputFieldProps {
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    showToggle?: boolean;
    onToggle?: () => void;
}

export default function InputField({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    showToggle = false,
    onToggle,
}: InputFieldProps) {
    return (
        <div>
            <label className="block mb-2 text-sm font-medium">{label}</label>
            <div className="relative">
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full border border-gray-300 p-3 rounded-md pr-10 outline-none focus:ring-2 focus:ring-orange-400"
                />
                {showToggle && (
                    <button type="button" onClick={onToggle} className="absolute right-3 top-3">
                        👁️
                    </button>
                )}
            </div>
        </div>
    );
}
