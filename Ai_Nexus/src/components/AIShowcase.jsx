import { useState } from 'react';
import { Play, Eye, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

const showcaseItems = [
  {
    id: 1,
    title: 'Real-time Object Detection in Autonomous Vehicles',
    description: 'Advanced computer vision system identifying and tracking objects with 99.8% accuracy in complex urban environments.',
    category: 'Computer Vision',
    company: 'Tesla AI',
    image: 'https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjUyMzE2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 45200,
    likes: 3420,
  },
  {
    id: 2,
    title: 'AI-Powered Drug Discovery Platform',
    description: 'Machine learning model that accelerates pharmaceutical research by predicting molecular interactions and drug efficacy.',
    category: 'Healthcare',
    company: 'DeepMind Health',
    image: 'https://images.unsplash.com/photo-1625314887424-9f190599bd56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHJvYm90JTIwZnV0dXJpc3RpY3xlbnwxfHx8fDE3NjUyNjMwODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 38900,
    likes: 2850,
  },
  {
    id: 3,
    title: 'Natural Language Code Generation',
    description: 'Transform plain English descriptions into production-ready code across multiple programming languages.',
    category: 'Development',
    company: 'OpenAI',
    image: 'https://images.unsplash.com/photo-1622131815526-eaae1e615381?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBsYXB0b3B8ZW58MXx8fHwxNzY1MjA5NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 62100,
    likes: 5240,
  },
  {
    id: 4,
    title: 'Climate Prediction and Modeling System',
    description: 'AI system analyzing vast climate datasets to predict weather patterns and environmental changes with unprecedented precision.',
    category: 'Environment',
    company: 'Google AI',
    image: 'https://images.unsplash.com/photo-1584291527908-033f4d6542c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwdmlzdWFsaXphdGlvbiUyMHNjcmVlbnxlbnwxfHx8fDE3NjUyNTk4MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 29400,
    likes: 2180,
  },
  {
    id: 5,
    title: 'AI Music Composition Engine',
    description: 'Generative AI creating original music compositions across various genres, mimicking the styles of renowned composers.',
    category: 'Creative',
    company: 'Anthropic Arts',
    image: 'https://images.unsplash.com/photo-1582192904915-d89c7250b235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NjUyMDk3NDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 51800,
    likes: 4620,
  },
  {
    id: 6,
    title: 'Smart Manufacturing Quality Control',
    description: 'Computer vision and machine learning system detecting defects in manufacturing processes with millisecond response times.',
    category: 'Industry',
    company: 'Siemens AI',
    image: 'https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG9mZmljZXxlbnwxfHx8fDE3NjUxODE3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 33500,
    likes: 2740,
  },
];

export function AIShowcase({ preview = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedItems, setLikedItems] = useState(new Set());

  const displayedItems = preview ? showcaseItems.slice(0, 3) : showcaseItems;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayedItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayedItems.length - 1 ? 0 : prev + 1));
  };

  const toggleLike = (id) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (preview) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 group">
            <div className="relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="bg-sky-500 text-white p-4 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                  <Play className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">{item.category}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{item.company}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 clamp-2">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 clamp-3">{item.description}</p>
              <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>{item.views.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => toggleLike(item.id)}
                  className={`flex items-center gap-2 transition-colors ${likedItems.has(item.id) ? 'text-red-500' : 'hover:text-red-500'}`}
                >
                  <Heart
                    className={`w-5 h-5 ${likedItems.has(item.id) ? 'fill-current' : ''}`}
                  />
                  <span>{item.likes.toLocaleString()}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="relative">
          <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <img
              src={displayedItems[currentIndex].image}
              alt={displayedItems[currentIndex].title}
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
              key={currentIndex}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
               <div className="flex justify-between items-center mb-2">
                <span className="inline-block bg-sky-500/20 dark:bg-sky-400/20 text-sky-200 dark:text-sky-300 text-xs font-semibold px-3 py-1 rounded-full">{displayedItems[currentIndex].category}</span>
                <span className="text-xs text-slate-300">{displayedItems[currentIndex].company}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-2 text-shadow-lg">{displayedItems[currentIndex].title}</h2>
              <p className="text-sm md:text-base text-slate-200/90 clamp-2">{displayedItems[currentIndex].description}</p>
              <div className="mt-4 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>{displayedItems[currentIndex].views.toLocaleString()} views</span>
                </div>
                <button
                  onClick={() => toggleLike(displayedItems[currentIndex].id)}
                  className={`flex items-center gap-2 transition-colors ${likedItems.has(displayedItems[currentIndex].id) ? 'text-red-400' : 'hover:text-red-400'}`}
                >
                  <Heart className={`w-5 h-5 ${likedItems.has(displayedItems[currentIndex].id) ? 'fill-current' : ''}`} />
                  <span>{displayedItems[currentIndex].likes.toLocaleString()} likes</span>
                </button>
              </div>
            </div>
            <button className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white/20 text-white p-5 rounded-full backdrop-blur-sm shadow-lg transform scale-75 hover:scale-100 transition-transform duration-300">
                <Play className="w-8 h-8" />
              </span>
            </button>
          </div>

          <button
            onClick={handlePrevious}
            className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2 bg-white/80 dark:bg-slate-700/80 p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-600 transition-all backdrop-blur-sm z-10"
          >
            <ChevronLeft className="w-6 h-6 text-slate-800 dark:text-white" />
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 bg-white/80 dark:bg-slate-700/80 p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-600 transition-all backdrop-blur-sm z-10"
          >
            <ChevronRight className="w-6 h-6 text-slate-800 dark:text-white" />
          </button>
        </div>

        <div className="flex justify-center gap-2 sm:gap-4 mt-8">
          {displayedItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-110 focus:outline-none ring-offset-2 dark:ring-offset-slate-900 ${index === currentIndex ? 'ring-4 ring-sky-500' : 'ring-2 ring-transparent'}`}
            >
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-black/50"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
