import { ProjectAsset } from '../types';

interface MediaAssetProps {
  asset: ProjectAsset;
  compact?: boolean;
  onClick?: () => void;
}

export function MediaAsset({ asset, compact = false }: MediaAssetProps) {
  const className = `media-asset ${compact ? 'compact' : ''}`;

  if (asset.type === 'video') {
    return (
      <video className={className} src={asset.url} controls muted playsInline autoPlay preload="metadata">
        Your browser does not support the video tag.
      </video>
    );
  }

  if (asset.type === 'lottie') {
    return (
      <div className={`lottie-placeholder ${compact ? 'compact' : ''}`}>
        <span>Lottie</span>
        <strong>{asset.alt ?? 'Animation asset'}</strong>
        <code>{asset.url}</code>
        <small>
          This placeholder keeps the JSON data ready for a Lottie renderer such as lottie-react.
        </small>
      </div>
    );
  }

  return <img className={className} src={asset.url} alt={asset.alt ?? 'Project asset'} />;
}



export function MediaAsset2({ asset, compact = false, onClick }: MediaAssetProps) {
  const className = `media-asset ${compact ? 'compact' : ''}`;

  if (asset.type === 'video') {
    return (
      <video className={className} src={asset.url} muted preload="metadata" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }} >
        Your browser does not support the video tag.
      </video>
    );
  }

  if (asset.type === 'lottie') {
    return (
      <div className={`lottie-placeholder ${compact ? 'compact' : ''}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <span>Lottie</span>
        <strong>{asset.alt ?? 'Animation asset'}</strong>
        <code>{asset.url}</code>
        <small>
          This placeholder keeps the JSON data ready for a Lottie renderer such as lottie-react.
        </small>
      </div>
    );
  }

  return <img className={className} src={asset.url} alt={asset.alt ?? 'Project asset'} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }} />;
}
