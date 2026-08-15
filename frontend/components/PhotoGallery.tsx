'use client';

import { useEffect, useState } from 'react';
import { usePhotoUpload, UploadedPhoto } from '@/hooks/usePhotoUpload';
import { Trash2, Download, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PhotoGallery() {
  const { fetchPhotos, deletePhoto, uploadedPhotos, isUploading } = usePhotoUpload();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<UploadedPhoto | null>(null);

  useEffect(() => {
    const loadPhotos = async () => {
      setIsLoading(true);
      await fetchPhotos();
      setIsLoading(false);
    };
    loadPhotos();
  }, [fetchPhotos]);

  const handleDelete = async (photoId: string) => {
    if (confirm('Delete this photo?')) {
      await deletePhoto(photoId);
    }
  };

  const getSignalColor = (signal: string | null) => {
    switch (signal) {
      case 'RED': return 'text-[#ff3b3b]';
      case 'GREEN': return 'text-[#00ff9f]';
      case 'YELLOW': return 'text-[#ffd60a]';
      default: return 'text-gray-400';
    }
  };

  const getSignalBg = (signal: string | null) => {
    switch (signal) {
      case 'RED': return 'bg-[#ff3b3b]/10 border-[#ff3b3b]/30';
      case 'GREEN': return 'bg-[#00ff9f]/10 border-[#00ff9f]/30';
      case 'YELLOW': return 'bg-[#ffd60a]/10 border-[#ffd60a]/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading photos...</div>
      </div>
    );
  }

  if (uploadedPhotos.length === 0) {
    return (
      <div className="glass-effect rounded-2xl p-12 border border-[#00ff9f]/20 text-center">
        <h3 className="text-xl font-bold text-gray-400 mb-2">No photos yet</h3>
        <p className="text-gray-500">Capture photos from your mobile device to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gallery Stats */}
      <div className="glass-effect rounded-2xl p-6 border border-[#00ff9f]/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-[#00ff9f]">{uploadedPhotos.length}</div>
            <div className="text-sm text-gray-400">Total Photos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#ffd60a]">
              {uploadedPhotos.filter(p => p.signal === 'RED').length}
            </div>
            <div className="text-sm text-gray-400">RED Signals</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#00ff9f]">
              {uploadedPhotos.filter(p => p.signal === 'GREEN').length}
            </div>
            <div className="text-sm text-gray-400">GREEN Signals</div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uploadedPhotos.map((photo) => (
          <div
            key={photo.id}
            className="glass-effect rounded-xl overflow-hidden border border-[#00ff9f]/20 hover:border-[#00ff9f]/50 transition-all cursor-pointer group"
            onClick={() => setSelectedPhoto(photo)}
          >
            {/* Image */}
            <div className="relative overflow-hidden bg-black h-48">
              <img
                src={photo.url}
                alt="Traffic signal"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />

              {/* Signal Overlay */}
              <div className={cn(
                "absolute top-2 right-2 px-3 py-1 rounded-lg border border-[#00ff9f]/30 font-bold text-sm",
                getSignalBg(photo.signal),
                getSignalColor(photo.signal)
              )}>
                {photo.signal || 'Unknown'}
              </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              {/* Confidence */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Confidence</span>
                <span className="text-sm font-bold text-[#00ff9f]">{photo.confidence}%</span>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-gray-500">
                {new Date(photo.uploadedAt).toLocaleString()}
              </div>

              {/* Device Type */}
              <div className="text-xs px-2 py-1 bg-gray-700/50 rounded w-fit">
                {photo.deviceType.toUpperCase()}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded bg-[#00ff9f]/10 hover:bg-[#00ff9f]/20 border border-[#00ff9f]/30 text-[#00ff9f] text-sm font-semibold transition-all"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo.id);
                  }}
                  className="flex items-center justify-center px-2 py-2 rounded bg-[#ff3b3b]/10 hover:bg-[#ff3b3b]/20 border border-[#ff3b3b]/30 text-[#ff3b3b] text-sm font-semibold transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="bg-[#141829] rounded-2xl border-2 border-[#00ff9f]/30 max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              {/* Image */}
              <img
                src={selectedPhoto.url}
                alt="Traffic signal"
                className="w-full rounded-xl"
              />

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className={cn("p-3 rounded-lg border", getSignalBg(selectedPhoto.signal))}>
                  <div className="text-xs text-gray-400">Signal</div>
                  <div className={cn("text-2xl font-bold", getSignalColor(selectedPhoto.signal))}>
                    {selectedPhoto.signal || 'Unknown'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#00ff9f]/10 border border-[#00ff9f]/30">
                  <div className="text-xs text-gray-400">Confidence</div>
                  <div className="text-2xl font-bold text-[#00ff9f]">{selectedPhoto.confidence}%</div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
