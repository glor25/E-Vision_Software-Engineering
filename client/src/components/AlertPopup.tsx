import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';
import "../index.css";
interface AlertPopupProps {
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
    duration: number;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const AlertPopup: React.FC<AlertPopupProps> = ({ type = 'success', message, onClose, duration = 3000 }) => {
    const isSuccess = type === 'success';

    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.4 }}
                className={`fixed top-5 right-5 z-50 flex items-center max-w-sm p-4 rounded-xl shadow-lg border-l-4 
                    ${isSuccess ? 'bg-green-50 border-green-600 text-green-800' : 'bg-red-50 border-red-600 text-red-800'}`}
            >
                <div className="mr-3">
                    {isSuccess ? (
                        <CheckCircle className="text-green-600" />
                    ) : (
                        <XCircle className="text-red-600" />
                    )}
                </div>
                <div className="flex-1">{message}</div>
                <button onClick={onClose} className="ml-4 hover:opacity-75">
                    <X className="w-4 h-4" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

export default AlertPopup;
