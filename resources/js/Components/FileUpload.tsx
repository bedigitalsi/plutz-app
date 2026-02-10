import React, { useRef, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import InputLabel from './InputLabel';
import InputError from './InputError';

interface FileUploadProps {
    label?: string;
    accept?: string;
    onChange: (file: File | null) => void;
    error?: string;
}

export default function FileUpload({
    label,
    accept = 'image/*,application/pdf',
    onChange,
    error,
}: FileUploadProps) {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onChange(file);
        
        if (file) {
            setFileName(file.name);
            
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
                    className="hidden"
                />
                
                {!fileName ? (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full rounded-xl border-2 border-dashed border-plutz-tan/20 p-6 text-center hover:border-plutz-tan/40 focus:outline-none focus:ring-2 focus:ring-plutz-tan focus:ring-offset-2 focus:ring-offset-plutz-dark bg-plutz-dark transition-colors"
                    >
                        <span className="material-symbols-outlined text-stone-500 text-4xl mx-auto block">upload_file</span>
                        <p className="mt-2 text-sm text-stone-400">
                            {t('component.file_upload_button')}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                            {t('component.file_upload_formats')}
                        </p>
                    </button>
                ) : (
                    <div className="rounded-xl border border-plutz-tan/10 bg-plutz-surface p-4">
                        {preview ? (
                            <div className="mb-4">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="mx-auto max-h-48 rounded-lg"
                                />
                            </div>
                        ) : (
                            <div className="mb-4 flex items-center justify-center">
                                <span className="material-symbols-outlined text-stone-500 text-4xl">description</span>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-plutz-cream truncate">{fileName}</p>
                            <button
                                type="button"
                                onClick={clearFile}
                                className="ml-4 text-sm text-red-400 hover:text-red-300"
                            >
                                {t('component.file_upload_remove')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {error && <InputError message={error} className="mt-2" />}
        </div>
    );
}
