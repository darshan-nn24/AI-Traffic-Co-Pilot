'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UploadedPhoto } from './usePhotoUpload';

export function useRealtimePhotoSync() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [newPhotoAlert, setNewPhotoAlert] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let subscription: any = null;

    const subscribeToPhotos = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        // Subscribe to changes
        subscription = supabase
          .channel(`user_photos:${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_photos',
              filter: `user_id=eq.${user.id}`
            },
            (payload: any) => {
              if (payload.eventType === 'INSERT') {
                const newPhoto: UploadedPhoto = {
                  id: payload.new.id,
                  url: payload.new.url,
                  userId: payload.new.user_id,
                  signal: payload.new.signal,
                  confidence: payload.new.confidence,
                  timestamp: new Date(payload.new.created_at).getTime(),
                  deviceType: payload.new.device_type,
                  uploadedAt: payload.new.created_at
                };
                setPhotos(prev => [newPhoto, ...prev]);
                setNewPhotoAlert(`New ${newPhoto.signal || 'photo'} detected from ${newPhoto.deviceType}!`);
                setTimeout(() => setNewPhotoAlert(null), 3000);
              } else if (payload.eventType === 'DELETE') {
                setPhotos(prev => prev.filter(p => p.id !== payload.old.id));
              }
            }
          )
          .subscribe((status: string) => {
            setIsConnected(status === 'SUBSCRIBED');
          });
      } catch (err) {
        console.error('[v0] Subscription error:', err);
      }
    };

    subscribeToPhotos();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  return {
    photos,
    setPhotos,
    isConnected,
    newPhotoAlert
  };
}
