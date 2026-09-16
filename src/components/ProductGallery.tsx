import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize2,
  Zap,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export interface GalleryVideo {
  id?: string;
  url: string;
  title: string;
  duration: string;
  thumbnail: string;
  tag?: string;
  sourceUrl?: string;
  chapters?: Array<{ time: number; label: string }>;
}

interface ProductGalleryProps {
  images: string[];
  video?: GalleryVideo;
  productTitle: string;
  selectedColor: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  video,
  productTitle,
  selectedColor,
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(59);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeImage = images[activeImageIndex] || images[0];
  const currentVideo = video || {
    id: 'video-spray-vedatudo',
    url: '/dryko-spray-vedatudo-branco-demonstracao.mp4',
    title: 'Demonstração: Aplicação Spray Borracha Líquida Dryko',
    duration: '0:59',
    thumbnail: '/thumb-spray-branco-video.jpg',
    sourceUrl: 'https://streamable.com/oiup7n',
    chapters: [
      { time: 0, label: '01. Apresentação' },
      { time: 10, label: '02. Agitação & Preparo' },
      { time: 22, label: '03. Aplicação em Superfície' },
      { time: 38, label: '04. Película Impermeável' },
      { time: 50, label: '05. Resultado Final' },
    ],
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration || 59);
    }
  };

  const seekToChapter = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      if (!isPlaying) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Reset to first image when images prop changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [images]);

  // Reset video playback when switching away
  useEffect(() => {
    if (activeTab !== 'video' && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3 w-full select-none">
      {/* Thumbnails strip */}
      {(images.length > 1 || !!currentVideo) && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[520px] p-0.5 no-scrollbar">
          {/* Photo Thumbnails */}
          {images.map((img, idx) => (
            <button
              key={`img-${idx}`}
              type="button"
              onClick={() => {
                setActiveTab('image');
                setActiveImageIndex(idx);
              }}
              onMouseEnter={() => {
                setActiveTab('image');
                setActiveImageIndex(idx);
              }}
              className={`relative shrink-0 w-12 sm:w-14 h-12 sm:h-14 rounded border transition-all p-1 bg-white cursor-pointer ${
                activeTab === 'image' && activeImageIndex === idx
                  ? 'border-[#3483fa] shadow-sm ring-2 ring-[#3483fa]'
                  : 'border-neutral-200 hover:border-neutral-400 opacity-80 hover:opacity-100'
              }`}
              title={`Foto ${idx + 1} - ${selectedColor}`}
            >
              <img
                src={img}
                alt={`Miniatura ${idx + 1}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </button>
          ))}

          {/* Single Video Thumbnail (Mercado Livre authentic style) */}
          {currentVideo && (
            <button
              key="video-thumb"
              type="button"
              onClick={() => {
                setActiveTab('video');
                setIsPlaying(true);
                setTimeout(() => videoRef.current?.play().catch(() => {}), 50);
              }}
              onMouseEnter={() => {
                setActiveTab('video');
              }}
              className={`relative shrink-0 w-12 sm:w-14 h-12 sm:h-14 rounded border transition-all p-0.5 bg-neutral-900 cursor-pointer overflow-hidden group ${
                activeTab === 'video'
                  ? 'border-[#3483fa] shadow-sm ring-2 ring-[#3483fa]'
                  : 'border-neutral-300 hover:border-neutral-500 opacity-90 hover:opacity-100'
              }`}
              title={currentVideo.title}
            >
              <img
                src={currentVideo.thumbnail || images[0]}
                alt="Miniatura Vídeo"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                <div className="w-5 h-5 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-110">
                  <Play size={10} className="fill-white ml-0.5" />
                </div>
                <span className="text-[9px] font-bold text-white tracking-tight mt-0.5 drop-shadow-xs">
                  Vídeo
                </span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Main Stage container */}
      <div className="relative flex-1 bg-white rounded-md border border-neutral-200 flex flex-col items-center justify-center min-h-[360px] sm:min-h-[480px] p-2 sm:p-4 overflow-hidden group">
        {/* Full delivery badge overlay */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-[#00a650] text-white text-[11px] font-bold px-2 py-0.5 rounded-xs shadow-xs">
          <Zap size={12} className="fill-white" />
          <span>FULL</span>
        </div>

        {/* Expand image button */}
        {activeTab === 'image' && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 hover:bg-white text-neutral-600 hover:text-black rounded-full shadow-xs border border-neutral-200 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Ver imagem ampliada"
          >
            <Maximize2 size={16} />
          </button>
        )}

        {/* --- VIEW MODE 1: IMAGE WITH ZOOM LENS --- */}
        {activeTab === 'image' ? (
          <div
            ref={imageContainerRef}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setLightboxOpen(true)}
            className="w-full h-[320px] sm:h-[440px] flex items-center justify-center cursor-zoom-in relative"
          >
            <img
              src={activeImage}
              alt={productTitle}
              className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${
                isZooming ? 'md:opacity-20' : 'opacity-100'
              }`}
            />

            {/* Desktop Hover Magnifier view */}
            {isZooming && (
              <div
                className="hidden md:block absolute inset-0 pointer-events-none rounded bg-no-repeat bg-white shadow-inner"
                style={{
                  backgroundImage: `url(${activeImage})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: '220%',
                }}
              />
            )}
          </div>
        ) : (
          /* --- VIEW MODE 2: AUTHENTIC PRODUCT VIDEO PLAYER --- */
          <div className="w-full h-full flex flex-col items-center justify-between py-2">
            {/* Header info bar */}
            <div className="w-full flex items-center justify-between gap-1.5 text-xs text-neutral-500 mb-2 px-1">
              <span className="font-semibold text-neutral-800 flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0" />
                <span className="truncate">{currentVideo.title}</span>
              </span>

              {currentVideo.sourceUrl && (
                <a
                  href={currentVideo.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#3483fa] hover:text-[#2968c8] hover:underline flex items-center gap-1 font-medium shrink-0"
                  title="Assistir no Streamable"
                >
                  <ExternalLink size={12} />
                  <span>Streamable</span>
                </a>
              )}
            </div>

            {/* Video container */}
            <div className="relative w-full aspect-16/10 sm:aspect-16/9 max-h-[380px] bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-inner group/video">
              <video
                ref={videoRef}
                src={currentVideo.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onClick={togglePlay}
                playsInline
                className="w-full h-full object-contain cursor-pointer"
              />

              {/* Big Play Overlay button when paused */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg cursor-pointer z-10"
                >
                  <Play size={28} className="fill-white ml-1" />
                </button>
              )}

              {/* Custom Controls bar on bottom */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex flex-col gap-1.5 opacity-95 transition-opacity">
                {/* Progress bar scrubber */}
                <input
                  type="range"
                  min="0"
                  max={videoDuration || 59}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-[#3483fa]"
                />

                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="hover:text-[#3483fa] transition-colors cursor-pointer"
                      title={isPlaying ? 'Pausar' : 'Reproduzir'}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-current" />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="hover:text-[#3483fa] transition-colors cursor-pointer"
                      title={isMuted ? 'Ativar som' : 'Silenciar'}
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>

                    <span className="text-[11px] font-mono text-neutral-300">
                      {formatTime(currentTime)} / {formatTime(videoDuration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => seekToChapter(0)}
                      className="hover:text-[#3483fa] p-1 cursor-pointer"
                      title="Reiniciar vídeo"
                    >
                      <RotateCcw size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          if (document.fullscreenElement) {
                            document.exitFullscreen();
                          } else {
                            videoRef.current.requestFullscreen?.();
                          }
                        }
                      }}
                      className="hover:text-[#3483fa] p-1 cursor-pointer"
                      title="Tela cheia"
                    >
                      <Maximize2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Chapters Navigation */}
            {currentVideo.chapters && currentVideo.chapters.length > 0 && (
              <div className="w-full mt-2">
                <p className="text-[10px] text-neutral-400 font-semibold mb-1 uppercase tracking-wider">
                  Capítulos do vídeo:
                </p>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {currentVideo.chapters.map((ch, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => seekToChapter(ch.time)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap cursor-pointer transition-colors ${
                        currentTime >= ch.time &&
                        (i === currentVideo.chapters!.length - 1 || currentTime < currentVideo.chapters![i + 1].time)
                          ? 'bg-[#3483fa] text-white border-[#3483fa] font-medium'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Fullscreen Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] p-6 flex flex-col items-center justify-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-900 p-2 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X size={22} />
            </button>

            {/* Main Lightbox Content */}
            <div className="relative w-full flex items-center justify-center min-h-[400px]">
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                  }
                  className="absolute left-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-md text-neutral-700 hover:text-black transition-all cursor-pointer z-10"
                  title="Foto anterior"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <img
                src={activeImage}
                alt={productTitle}
                className="max-h-[65vh] w-auto object-contain select-none"
              />

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-md text-neutral-700 hover:text-black transition-all cursor-pointer z-10"
                  title="Próxima foto"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Bottom mini-thumbnails in modal */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto p-1 max-w-full">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-14 h-14 rounded border p-1 bg-white cursor-pointer transition-all ${
                      activeImageIndex === i
                        ? 'border-[#3483fa] ring-2 ring-[#3483fa]'
                        : 'border-neutral-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Miniatura" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
