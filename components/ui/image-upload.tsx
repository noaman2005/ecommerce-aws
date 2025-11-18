'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
  uploadEndpoint?: string;
  entityId?: string;
  token?: string;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  className = '',
  uploadEndpoint = '/api/upload',
  entityId,
  token,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const availableSlots = Math.max(maxImages - images.length, 0);
    if (availableSlots === 0) {
      toast.info(`Maximum of ${maxImages} images reached.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const queue = Array.from(files).slice(0, availableSlots);

    setUploading(true);

    try {
      const uploaded: string[] = [];

      for (const file of queue) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a supported image type.`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds the 5MB size limit.`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        if (entityId) {
          formData.append('productId', entityId);
        }

        const response = await fetch(uploadEndpoint, {
          method: 'POST',
          body: formData,
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });

        if (!response.ok) {
          const message = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(message?.error || 'Failed to upload image');
        }

        const data = await response.json();
        if (data?.url) {
          uploaded.push(data.url as string);
        }
      }

      if (uploaded.length > 0) {
        onImagesChange([...images, ...uploaded]);
        toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-contain bg-white"
                />
              </div>
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              className="cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : `Upload Images (${images.length}/${maxImages})`}
            </Button>
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: JPG, PNG, GIF. Max size: 5MB per image.
          </p>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No images uploaded yet</p>
          <p className="text-sm text-gray-500">
            Add images to showcase your product
          </p>
        </div>
      )}
    </div>
  );
}
