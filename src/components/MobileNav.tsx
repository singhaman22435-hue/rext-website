import React from 'react';
import { Home, Search, Heart, HardDrive, Library, Sliders } from 'lucide-react';
import { ViewType } from '../types';

interface MobileNavProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  likedCount: number;
  downloadCount: number;
  onOpenBassLab: () => void;
  onOpenLibraryDrawer: () => void;
  onFocusSearch: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onNavigate,
  likedCount,
  downloadCount,
  onOpenBassLab,
  onOpenLibraryDrawer,
  onFocusSearch,
}) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-main)]/95 backdrop-blur-2xl border-t border-[var(--border-color)] px-2 py-1.5 transition-colors duration-300"
      style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom, 0px))' }}
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-2 rounded-xl transition-colors ${
            currentView === 'home'
              ? 'text-[var(--accent-orange)] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 ${currentView === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </button>

        {/* Search */}
        <button
          onClick={onFocusSearch}
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5 tracking-tight">Search</span>
        </button>

        {/* Liked */}
        <button
          onClick={() => onNavigate('favorites')}
          className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-2 rounded-xl transition-colors ${
            currentView === 'favorites'
              ? 'text-[var(--accent-orange)] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
          aria-label="Liked Songs"
        >
          <Heart className={`w-5 h-5 ${currentView === 'favorites' ? 'fill-current stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Liked</span>
          {likedCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-[var(--accent-orange)] text-white text-[9px] font-bold flex items-center justify-center">
              {likedCount > 99 ? '99+' : likedCount}
            </span>
          )}
        </button>

        {/* Downloads */}
        <button
          onClick={() => onNavigate('downloads')}
          className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-2 rounded-xl transition-colors ${
            currentView === 'downloads'
              ? 'text-[var(--accent-blue)] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
          aria-label="Offline Vault"
        >
          <HardDrive className={`w-5 h-5 ${currentView === 'downloads' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Vault</span>
          {downloadCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-[var(--accent-blue)] text-white text-[9px] font-bold flex items-center justify-center">
              {downloadCount}
            </span>
          )}
        </button>

        {/* EQ & Bass */}
        <button
          onClick={onOpenBassLab}
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          aria-label="Equalizer & Bass"
        >
          <Sliders className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5 tracking-tight">EQ / Bass</span>
        </button>

        {/* Library / Playlists Drawer */}
        <button
          onClick={onOpenLibraryDrawer}
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          aria-label="Library & Playlists"
        >
          <Library className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5 tracking-tight">Library</span>
        </button>
      </div>
    </nav>
  );
};

