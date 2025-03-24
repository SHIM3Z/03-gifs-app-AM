import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';
import { map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GifService {
  private http = inject(HttpClient);

  trendingGifs = signal<Gif[]>([]);
  trendingGifsIsLoading = signal<boolean>(true);
  // searchingGifsIsLoading = signal<boolean>(true);
  searchHistory = signal<Record<string, Gif[]>>({});
  searchHistoryKey = computed(() => Object.keys(this.searchHistory()));

  constructor() {
    this.loadTrendingGifs();
  }

  loadTrendingGifs() {
    this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: 20,
        },
      })
      .subscribe((resp) => {
        const gifs = GifMapper.mapGifphyItemsToGifArray(resp.data);
        this.trendingGifs.set(gifs);
        this.trendingGifsIsLoading.set(false);
        console.log({ gifs });
      });
  }

  searchGifs(query: string) {
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
}
