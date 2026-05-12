import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { authenticatedFetch } from '../utils/supabase-client';
import { toast } from 'sonner';

// ============================================
// PHOTO UPLOAD COMPONENT
// ============================================
// Upload photos to Supabase Storage

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 5 }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      toast.error(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          return null;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          return null;
        }

        // Convert to base64
        return new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          
          reader.onload = async () => {
            const base64Image = reader.result as string;
            
            try {
              console.log('📸 Uploading photo:', file.name);
              
              const response = await authenticatedFetch('/upload-photo', {
                method: 'POST',
                body: JSON.stringify({
                  base64Image,
                  fileName: file.name,
                }),
              });

              if (!response.ok) {
                const error = await response.json();
                console.error('Upload failed:', error);
                toast.error(`Failed to upload ${file.name}`);
                resolve(null);
                return;
              }

              const data = await response.json();
              console.log('✅ Photo uploaded:', data.url);
              resolve(data.url);
            } catch (error) {
              console.error('Upload error:', error);
              toast.error(`Failed to upload ${file.name}`);
              resolve(null);
            }
          };

          reader.onerror = () => {
            toast.error(`Failed to read ${file.name}`);
            resolve(null);
          };

          reader.readAsDataURL(file);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);

      if (validUrls.length > 0) {
        onPhotosChange([...photos, ...validUrls]);
        toast.success(`${validUrls.length} photo(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    toast.success('Photo removed');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <button
        type="button"
        onClick={handleUploadClick}
        disabled={uploading || photos.length >= maxPhotos}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Upload size={20} />
            <span>
              Upload Photos ({photos.length}/{maxPhotos})
            </span>
          </>
        )}
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {photos.length === 0 && (
        <p className="text-sm text-gray-500 text-center">
          JPG, PNG, WebP, or GIF (max 5MB each)
        </p>
      )}
    </div>
  );
}
