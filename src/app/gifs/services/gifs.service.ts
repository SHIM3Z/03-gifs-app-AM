import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';
import { map, Observable, of, tap } from 'rxjs';

const GIFS_KEY = 'gifs';

const loadFormLocalStorage = () => {
  const gifsFromLocalStorage = localStorage.getItem(GIFS_KEY) ?? '{}';
  const gif = JSON.parse(gifsFromLocalStorage);
  return gif;
};

@Injectable({ providedIn: 'root' })
export class GifService {
  private http = inject(HttpClient);

  trendingGifs = signal<Gif[]>([]);
  trendingGifsIsLoading = signal<boolean>(false);
  private trendingPage = signal(0);

  trendingGifGroup = computed<Gif[][]>(() => {
    const groups = [];
    for (let i = 0; i < this.trendingGifs().length; i += 3) {
      groups.push(this.trendingGifs().slice(i, i + 3));
    }

    return groups;
  });

  searchHistory = signal<Record<string, Gif[]>>(loadFormLocalStorage());
  searchHistoryKey = computed(() => Object.keys(this.searchHistory()));
  saveGifsToLocalStorage = effect(() => {
    const historyString = JSON.stringify(this.searchHistory());
    localStorage.setItem(GIFS_KEY, historyString);
  });

  constructor() {
    this.loadTrendingGifs();
  }

  loadTrendingGifs() {
    if (this.trendingGifsIsLoading()) return;
    this.trendingGifsIsLoading.set(true);
    this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: 20,
          offset: this.trendingPage() * 20,
        },
      })
      .subscribe((resp) => {
        const gifs = GifMapper.mapGifphyItemsToGifArray(resp.data);
        this.trendingGifs.update((currentGifs) => [...currentGifs, ...gifs]);
        this.trendingPage.update((page) => page + 1);
        this.trendingGifsIsLoading.set(false);
      });
  }

  searchGifs(query: string): Observable<Gif[]> {
    return (
      this.http
        .get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
          params: {
            api_key: environment.giphyApiKey,
            q: query,
            limit: 20,
          },
        })
        //lo que hace es destructurar el objeto y solo obtener la data
        //luego le con el otro map le pasamos la repsuesta de la data
        //y lo que hace es mapear la respuesta de la data a un array de gifs
        .pipe(
          map(({ data }) => data),
          map((resp) => GifMapper.mapGifphyItemsToGifArray(resp)),
          tap((items) => {
            this.searchHistory.update((history) => ({
              ...history,
              [query.toLowerCase()]: items,
            }));
          })
        )
    );
    //hace lo mismo que el anterior pero con una sola linea
    // .pipe(map((resp) => GifMapper.mapGifphyItemsToGifArray(resp.data)));
    //hace lo mismo que el anterior pero con una sola linea
    // .pipe(map(({ data }) => GifMapper.mapGifphyItemsToGifArray(data)));
    // .subscribe((resp) => {
    //   const gifSearch = GifMapper.mapGifphyItemsToGifArray(resp.data);
    //   this.searchingGifs.set(gifSearch);
    //   this.searchingGifsIsLoading.set(false);
    // });
  }

  getHistoryGifs(query: string): Gif[] {
    return this.searchHistory()[query] ?? [];
  }
}
