import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  imports: [],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.scss',
})
export class StarRating {
  rating = input<number>(0);
  showValue = input<boolean>(false);
  reviewsCount = input<number | null>(null);

  readonly stars = computed(() => {
    const r = Math.round(this.rating() * 2) / 2;
    return Array.from({ length: 5 }, (_, i) => {
      const idx = i + 1;
      if (r >= idx) return 'full';
      if (r + 0.5 === idx) return 'half';
      return 'empty';
    });
  });
}
