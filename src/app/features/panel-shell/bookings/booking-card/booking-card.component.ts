import { Component, input, output } from '@angular/core';
import { BookingListItemDto } from '../../../../api/service-proxies';
import { formatToman } from '../../../../core/helper/format';
import { formatTehranTime } from '../../../../core/helper/jalali-date';

@Component({
  imports: [],
  selector: 'app-booking-card',
  templateUrl: './booking-card.component.html',
})
export class BookingCardComponent {
  readonly booking = input.required<BookingListItemDto>();
  readonly busy = input(false);

  readonly confirm = output<BookingListItemDto>();
  readonly cancel = output<BookingListItemDto>();

  protected readonly toman = formatToman;
  protected readonly time = formatTehranTime;
}
