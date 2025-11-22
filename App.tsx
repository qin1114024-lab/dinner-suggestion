import React, { useState, useEffect, useCallback } from 'react';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { RestaurantCard } from './components/RestaurantCard.tsx';
import { LoadingSkeleton } from './components/LoadingSkeleton.tsx';
import { fetchRestaurants } from './services/geminiService.ts';
import { GeoLocation, Restaurant, CuisineType, LoadingState } from './types.ts';

const App: React.FC = () => {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('locating');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(CuisineType.RECOMMENDED);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Location Acquisition
  useEffect(() => {
    if (!navigator.geolocation) {
      setLoadingState('error');
      setErrorMsg('您的瀏覽器不支援地理定位功能');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingState('idle'); // Ready to fetch
      },
      (error) => {
        setLoadingState('error');
        setErrorMsg('無法取得您的位置，請開啟定位服務以尋找附近美食。');
        console.error(error);
      }
    );
  }, []);

  // Handle Data Fetching
  const loadRestaurants = useCallback(async (loc: GeoLocation, cat: string) => {
    setLoadingState('searching');
    setErrorMsg(null);
    try {
      const data = await fetchRestaurants(loc, cat);
      setRestaurants(data);
      setLoadingState('success');
    } catch (err) {
      console.error(err);
      setLoadingState('error');
      setErrorMsg('搜尋失敗，AI 可能忙碌中，請稍後再試。');
    }
  }, []);

  // Initial Load when location is found
  useEffect(() => {
    if (location && loadingState === 'idle') {
      loadRestaurants(location, selectedCategory);
    }
  }, [location, loadingState, selectedCategory, loadRestaurants]);

  // Handle Category Switch
  const handleCategoryChange = (category: string) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    if (location) {
      loadRestaurants(location, category);
    }
  };

  const handleRetry = () => {
    if (location) {
      loadRestaurants(location, selectedCategory);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm">
            <i className="fas fa-utensils"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">美食嚮導 AI</h1>
        </div>
        {location && (
          <div className="text-xs font-medium text-gray-600 flex items-center bg-gray-100 px-3 py-1.5 rounded-full">
            <i className="fas fa-location-dot text-primary mr-1.5"></i>
            <span>已定位</span>
          </div>
        )}
      </header>

      {/* Category Filter */}
      <CategoryFilter 
        selected={selectedCategory} 
        onSelect={handleCategoryChange} 
        disabled={loadingState === 'locating' || loadingState === 'searching'}
      />

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        
        {/* Locating State */}
        {loadingState === 'locating' && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="animate-bounce text-4xl text-primary mb-4 opacity-80">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">正在定位中...</h2>
            <p className="text-gray-500 text-sm mt-2">請允許位置存取權限以尋找附近美食。</p>
          </div>
        )}

        {/* Error State */}
        {loadingState === 'error' && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="text-4xl text-red-400 mb-4">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">糟糕！出錯了</h2>
            <p className="text-gray-500 text-sm mt-2 mb-6 max-w-xs mx-auto">{errorMsg}</p>
            <button 
              onClick={handleRetry}
              className="bg-primary text-white px-6 py-2.5 rounded-full font-medium hover:bg-red-600 transition-all shadow-md active:scale-95"
            >
              重試
            </button>
          </div>
        )}

        {/* Searching State (Skeleton) */}
        {loadingState === 'searching' && (
          <div className="animate-fade-in">
             <div className="flex items-center justify-center mb-8 bg-blue-50 text-blue-700 py-3 px-4 rounded-lg border border-blue-100">
               <i className="fas fa-circle-notch fa-spin mr-3 text-lg"></i>
               <span className="text-sm font-medium">AI 正在搜尋最佳的「{selectedCategory}」餐廳...</span>
             </div>
             <LoadingSkeleton />
          </div>
        )}

        {/* Success State (List) */}
        {loadingState === 'success' && (
          <div className="animate-fade-in-up">
            <div className="mb-6 flex justify-between items-end border-b border-gray-100 pb-2">
              <h2 className="text-xl font-bold text-gray-900">
                <i className="fas fa-fire text-red-500 mr-2"></i>
                附近的{selectedCategory}
              </h2>
              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">AI 推薦結果</span>
            </div>
            
            {restaurants.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                 <div className="text-4xl text-gray-300 mb-3"><i className="fas fa-store-slash"></i></div>
                 <p className="text-gray-500 font-medium">附近找不到此類別的餐廳。</p>
                 <button onClick={() => handleCategoryChange(CuisineType.RECOMMENDED)} className="mt-4 text-primary text-sm hover:underline">
                   查看精選推薦
                 </button>
               </div>
            ) : (
              restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} data={restaurant} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;