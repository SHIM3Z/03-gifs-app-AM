import { toSignal } from '@angular/core/rxjs-interop';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { map } from 'rxjs';

@Component({
  selector: 'gif-history',
  imports: [],
  templateUrl: './gif-history.component.html',
  styleUrl: './gif-history.component.css',
})
export default class GifHistoryComponent {
  query = toSignal(
    inject(ActivatedRoute).params.pipe(map((params) => params['query']))
  );
}
