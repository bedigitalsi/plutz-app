import React, { useRef, useState } from 'react';
import InputLabel from './InputLabel';
import InputError from './InputError';

interface FileUploadProps {
    label?: string;
    accept?: string;
    onChange: (file: File | null) => void;
    error?: string;
    capture?: boolean;
}

export default function FileUpload({
    label,
    accept = 'image/*,application/pdf',
    onChange,
    error,
    capture = true,
}: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onChange(file);
        
        if (file) {
            setFileName(file.name);
            
            // Show preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
            }
        } else {
            setFileName(null);
            setPreview(null);
        }
    };

    const clearFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setFileName(null);
        setPreview(null);
        onChange(null);
    };

    return (
        <div>
            {label && <InputLabel value={label} />}
            
            <div className="mt-1">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    capture={capture ? 'environment' : undefined}
                    className="hidden"
                />
                
                {!fileName ? (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full rounded-md border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                            Click to upload or take a photo
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            PNG, JPG, PDF up to 10MB
                        </p>
                    </button>
                ) : (
                    <div className="rounded-md border border-gray-300 p-4">
                        {preview ? (
                            <div className="mb-4">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="mx-auto max-h-48 rounded"
                                />
                            </div>
                        ) : (
                            <div className="mb-4 flex items-center justify-center">
                                <svg
                                    className="h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-900 truncate">{fileName}</p>
                            <button
                                type="button"
                                onClick={clearFile}
                                className="ml-4 text-sm text-red-600 hover:text-red-500"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {error && <InputError message={error} className="mt-2" />}
        </div>
    );
}
