'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface UploadedPhoto {
  id: string;
  url: string;
  userId: string;
  signal: 'RED' | 'YELLOW' | 'GREEN' | null;
  confidence: number;
  timestamp: number;
  deviceType: 'mobile' | 'desktop';
  uploadedAt: string;
}

export function usePhotoUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);

  const uploadPhoto = useCallback(async (
    photoBase64: string,
    signal: 'RED' | 'YELLOW' | 'GREEN' | null,
    confidence: number,
    deviceType: 'mobile' | 'desktop' = 'mobile'
  ): Promise<UploadedPhoto | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Not authenticated');
      }

      // Convert base64 to blob
      const base64Data = photoBase64.split(',')[1] || photoBase64;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/jpeg' });

      // Upload to Supabase Storage
      const fileName = `photos/${user.id}/${Date.now()}.jpg`;
      const { data: storageData, error: uploadError } = await supabase.storage
        .from('traffic-signals')
        .upload(fileName, blob);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('traffic-signals')
        .getPublicUrl(fileName);

      // Store metadata in database
      const photo: UploadedPhoto = {
        id: `${user.id}-${Date.now()}`,
        url: urlData.publicUrl,
        userId: user.id,
        signal,
        confidence,
        timestamp: Date.now(),
        deviceType,
        uploadedAt: new Date().toISOString()
      };

      // Save to database
      const { error: dbError } = await supabase
        .from('user_photos')
        .insert([{
          id: photo.id,
          user_id: user.id,
          url: photo.url,
          signal: photo.signal,
          confidence: photo.confidence,
          device_type: photo.deviceType,
          created_at: photo.uploadedAt
        }]);

      if (dbError) {
        throw dbError;
      }

      setUploadedPhotos(prev => [photo, ...prev]);
      return photo;
    } catch (err: any) {
      const errorMsg = err?.message || 'Upload failed';
      setError(errorMsg);
      console.error('[v0] Upload error:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Fetch user's photos
  const fetchPhotos = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('user_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const photos: UploadedPhoto[] = data.map((row: any) => ({
        id: row.id,
        url: row.url,
        userId: row.user_id,
        signal: row.signal,
        confidence: row.confidence,
        timestamp: new Date(row.created_at).getTime(),
        deviceType: row.device_type,
        uploadedAt: row.created_at
      }));

      setUploadedPhotos(photos);
      return photos;
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch photos');
      return [];
    }
  }, []);

  // Delete photo
  const deletePhoto = useCallback(async (photoId: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('user_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      setUploadedPhotos(prev => prev.filter(p => p.id !== photoId));
      return true;
    } catch (err: any) {
      setError(err?.message || 'Failed to delete photo');
      return false;
    }
  }, []);

  return {
    uploadPhoto,
    fetchPhotos,
    deletePhoto,
    uploadedPhotos,
    isUploading,
    error,
    setError
  };
}
