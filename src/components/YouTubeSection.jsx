import { useRealtimeData } from '../hooks/useRealtimeData';
import { getYoutubeVideos } from '../api/contentApi';

export default function YouTubeSection() {
    const { data: videos, loading } = useRealtimeData('youtube_videos', getYoutubeVideos);

    if (loading || videos.length === 0) return null;

  return (
    <section className="youtube-section" id="chess-tips">
      <div className="container">
        <h2 className="section-title">🎥 Chess Tips & Videos</h2>
        <p className="section-subtitle">Watch our latest chess tutorials and tips</p>
        <div className="video-grid">
          {videos.map((video) => (
            <div key={video.id} className="video-card glass-card" itemScope itemType="https://schema.org/VideoObject">
              <div className="video-embed">
                <iframe
                  src={`https://www.youtube.com/embed/${video.video_id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <h4 className="video-title" itemProp="name">{video.title}</h4>
              {video.target_keyword && (
                <span className="video-keyword">{video.target_keyword}</span>
              )}
              <meta itemProp="embedUrl" content={`https://www.youtube.com/embed/${video.video_id}`} />
              <meta itemProp="thumbnailUrl" content={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .youtube-section { padding: 4rem 0; }
        .youtube-section .section-title { text-align: center; font-size: 2rem; margin-bottom: 0.5rem; }
        .youtube-section .section-subtitle { text-align: center; color: #aaa; margin-bottom: 2rem; }
        .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .video-card { border-radius: 12px; overflow: hidden; background: rgba(30,30,60,0.6); border: 1px solid #333; }
        .video-embed { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; }
        .video-embed iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
        .video-title { padding: 0.8rem 1rem 0.3rem; margin: 0; font-size: 0.95rem; }
        .video-keyword { display: inline-block; margin: 0 1rem 0.8rem; font-size: 0.7rem; padding: 2px 8px; border-radius: 8px; background: rgba(59,130,246,0.15); color: #93c5fd; }
      `}</style>
    </section>
  );
}
