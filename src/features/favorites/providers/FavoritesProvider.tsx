import type { PropsWithChildren } from 'react';
import { createContext, useEffect, useState } from 'react';

import type { FavoriteShow } from '@/features/favorites/domain/favorite';
import { favoritesStorage } from '@/features/favorites/storage/favorites.storage';

type FavoritesContextValue = {
  favorites: FavoriteShow[];
  isHydrated: boolean;
  isFavorite: (id: number) => boolean;
  addFavorite: (show: FavoriteShow) => Promise<void>;
  removeFavorite: (id: number) => Promise<void>;
  toggleFavorite: (show: FavoriteShow) => Promise<void>;
};

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<FavoriteShow[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const storedFavorites = await favoritesStorage.readFavorites();

        if (active) {
          setFavorites(storedFavorites);
        }
      } catch {
        // Keep the app usable and avoid overwriting unreadable persisted data.
      } finally {
        if (active) {
          setIsHydrated(true);
        }
      }
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  const persistNextFavorites = async (nextFavorites: FavoriteShow[]) => {
    const previousFavorites = favorites;

    setFavorites(nextFavorites);

    try {
      await favoritesStorage.writeFavorites(nextFavorites);
    } catch {
      setFavorites(previousFavorites);
    }
  };

  const isFavorite = (id: number) => favorites.some((favorite) => favorite.id === id);

  const addFavorite = async (show: FavoriteShow) => {
    if (isFavorite(show.id)) {
      return;
    }

    await persistNextFavorites([...favorites, show]);
  };

  const removeFavorite = async (id: number) => {
    if (!isFavorite(id)) {
      return;
    }

    await persistNextFavorites(favorites.filter((favorite) => favorite.id !== id));
  };

  const toggleFavorite = async (show: FavoriteShow) => {
    if (isFavorite(show.id)) {
      await removeFavorite(show.id);
      return;
    }

    await addFavorite(show);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isHydrated,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
