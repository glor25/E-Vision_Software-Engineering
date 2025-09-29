// src/components/Input.tsx
import "../index.css";
import React from "react";

interface InputProps {
    type?: string;
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
}

export default function Input({
    type = "text",
    placeholder,
    value,
    defaultValue,
    onChange,
    name,
}: InputProps) {
    return (
        <input
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        name={name}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
    );
}
