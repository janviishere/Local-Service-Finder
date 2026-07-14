import { Star } from 'lucide-react';

export default function ReviewCard({ review, isDark }) {
  const cardBg = isDark ? 'var(--bg-card)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const textPri = isDark ? 'var(--text-primary)' : '#0F172A';
  const textSec = isDark ? 'var(--text-secondary)' : '#475569';

  return (
    <div 
      className="p-5 rounded-2xl border"
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-royal-blue/10 flex items-center justify-center text-royal-blue font-bold">
            {review.user?.avatar ? (
              <img src={review.user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              review.user?.name?.charAt(0) || 'U'
            )}
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: textPri }}>{review.user?.name || 'Anonymous'}</p>
            <p className="text-xs" style={{ color: textSec }}>
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              fill={i < review.rating ? "#F59E0B" : "transparent"} 
              color={i < review.rating ? "#F59E0B" : "#D1D5DB"} 
            />
          ))}
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: textSec }}>
        {review.comment}
      </p>
    </div>
  );
}
