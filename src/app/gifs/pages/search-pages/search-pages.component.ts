import { Component, inject, signal } from '@angular/core';
import { GifService } from '../../services/gifs.service';
import { ListComponent } from '../../components/list/list.component';
import { Gif } from '../../interfaces/gif.interface';

@Component({
  selector: 'app-search-pages',
  imports: [ListComponent],
  templateUrl: './search-pages.component.html',
  styleUrl: './search-pages.component.css',
})
export default class SearchPagesComponent {
  gifServices = inject(GifService);
  gifs = signal<Gif[]>([]);

  onSearch(query: string) {
    this.gifServices.searchGifs(query).subscribe((resp) => {
      this.gifs.set(resp);
    });
  }
}
