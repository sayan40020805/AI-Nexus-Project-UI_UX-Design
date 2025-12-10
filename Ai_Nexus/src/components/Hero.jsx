import { ArrowRight, Sparkles, Users } from 'lucide-react';

export function Hero({ onExploreModels, onJoinCommunity }) {
  return (
    <div className="relative bg-sky-600 dark:bg-gray-900 text-white overflow-hidden w-full">
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 dark:bg-sky-400/10 backdrop-blur-sm py-2 px-4 rounded-full mb-6 border border-white/20 dark:border-sky-400/20">
            <Sparkles className="w-4 h-4 text-sky-200 dark:text-sky-300" />
            <span className="text-sm font-medium text-slate-100 dark:text-sky-200">Welcome to the Future of AI</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-shadow-md">
            Your Gateway to the AI Industry
          </h1>

          <p className="text-lg md:text-xl text-sky-100 dark:text-sky-200/90 max-w-2xl mx-auto mb-8">
            Explore cutting-edge AI models, stay updated with industry news, advance your career, and connect with the global AI community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={onExploreModels}
              className="inline-flex items-center justify-center gap-2 bg-white text-sky-600 dark:bg-sky-400 dark:text-black font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-slate-100 dark:hover:bg-sky-300 transition-transform transform hover:scale-105 w-full sm:w-auto"
            >
              Explore AI Models
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onJoinCommunity}
              className="inline-flex items-center justify-center gap-2 bg-white/20 dark:bg-sky-400/20 border border-white/30 dark:border-sky-400/30 backdrop-blur-sm text-white dark:text-sky-100 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-white/30 dark:hover:bg-sky-400/30 transition-transform transform hover:scale-105 w-full sm:w-auto"
            >
              <Users className="w-5 h-5" />
              Join Community
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 pt-8 border-t border-white/20 dark:border-sky-400/20 max-w-xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-sky-200 dark:text-sky-300/80">AI Models</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">10k+</div>
              <div className="text-sm text-sky-200 dark:text-sky-300/80">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">2k+</div>
              <div className="text-sm text-sky-200 dark:text-sky-300/80">Job Listings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
