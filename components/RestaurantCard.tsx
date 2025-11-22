import React, { useState } from 'react';
import { Restaurant } from '../types.ts';

interface RestaurantCardProps {
  data: Restaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ data }) => {
  const [showReviews, setShowReviews] = useState(false);

  // Helper to determine button text and icon based on link type
  const getReservationInfo = (link: string) => {
    const lowerLink = link.toLowerCase();
    if (lowerLink.includes('inline.app')) {
      return { text: 'inline 訂位', icon: 'fas fa-mobile-screen-button' };
    }
    if (lowerLink.includes('opentable') || lowerLink.includes('tablecheck')) {
      return { text: '線上訂位', icon: 'fas fa-calendar-check' };
    }
    return { text: '前往訂位 / 官網', icon: 'fas fa-external-link-alt' };
  };

  const resInfo = data.reservationLink ? getReservationInfo(data.reservationLink) : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-lg hover:border-gray-200 mb-6 group">
      {/* Image & Header Mobile */}
      <div className="relative h-52 w-full overflow-hidden">
        <img 
          src={data.imageUrl} 
          alt={data.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-md text-xs font-bold text-gray-800 shadow-sm border border-gray-100">
          {data.priceLevel || "$$"}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
          <h3 className="text-white text-2xl font-bold truncate leading-tight shadow-black drop-shadow-md">{data.name}</h3>
          <p className="text-white/90 text-sm font-medium mt-1">{data.cuisine}</p>
        </div>
      </div>

      <div className="p-5">
        {/* Ratings & Meta */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded flex items-center shadow-sm">
              <span className="text-sm mr-1">{data.rating}</span> 
              <i className="fas fa-star text-[10px]"></i>
            </div>
            <span className="text-gray-400 text-xs font-medium">({data.reviewCount}+ 則評論)</span>
          </div>
          <a 
            href={data.googleMapsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary text-sm font-medium hover:text-red-600 hover:underline flex items-center transition-colors"
          >
            <i className="fas fa-map-location-dot mr-1.5"></i> 地圖
          </a>
        </div>

        <p className="text-gray-600 text-sm mb-5 leading-relaxed line-clamp-2">
          {data.description}
        </p>

        <div className="text-xs text-gray-500 mb-5 flex items-start">
           <i className="fas fa-location-arrow mr-2 mt-0.5 text-gray-400"></i> 
           <span className="leading-snug">{data.address}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-1">
          {data.reservationLink && resInfo ? (
            <a 
              href={data.reservationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-primary text-white text-center py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
            >
              <i className={`${resInfo.icon} mr-2`}></i> {resInfo.text}
            </a>
          ) : (
             <button disabled className="flex-1 bg-gray-100 text-gray-400 text-center py-3 rounded-xl font-semibold text-sm cursor-not-allowed border border-gray-200">
              <i className="fas fa-ban mr-1"></i> 無線上訂位
            </button>
          )}
          
          <button 
            onClick={() => setShowReviews(!showReviews)}
            className={`px-4 py-3 border rounded-xl text-sm font-semibold transition-all flex items-center active:scale-95 ${showReviews ? 'bg-gray-100 text-gray-800 border-gray-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {showReviews ? '收起' : '評論'}
          </button>
        </div>

        {/* Expandable Reviews Section */}
        {showReviews && (
          <div className="mt-5 pt-4 border-t border-gray-100 animate-fade-in">
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
              <i className="fas fa-comments text-gray-400 mr-2"></i>近期評論摘要
            </h4>
            <div className="space-y-3">
              {data.reviews && data.reviews.length > 0 ? data.reviews.map((review, idx) => (
                <div key={idx} className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-gray-800">{review.author}</span>
                    <div className="flex text-yellow-400 text-[9px]">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fas fa-star ${i < review.rating ? '' : 'text-gray-300'}`}></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs italic leading-relaxed">"{review.text}"</p>
                </div>
              )) : (
                <div className="text-center text-gray-400 text-xs py-2">暫無評論</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};