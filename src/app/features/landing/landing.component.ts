import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

type IconName = 'calendar' | 'check' | 'clock' | 'mobile';

interface Feature {
  icon: IconName;
  title: string;
  text: string;
}

interface Step {
  title: string;
  text: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-landing',
  styleUrl: './landing.component.scss',
  templateUrl: './landing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  protected readonly features: Feature[] = [
    {
      icon: 'calendar',
      title: 'نوبت‌دهی آنلاین',
      text: 'مشتری‌ها از لینک اختصاصی شما، خدمت و ساعت دلخواهشان را انتخاب می‌کنند. دیگر تلفن و دفترچه لازم نیست.',
    },
    {
      icon: 'check',
      title: 'تأیید با یک لمس',
      text: 'هر درخواست در پنل شما ثبت می‌شود. با یک دکمه تأیید یا لغو کنید؛ مشتری بلافاصله پیامک می‌گیرد.',
    },
    {
      icon: 'clock',
      title: 'ساعت کاری و خدمات',
      text: 'ساعت کاری هر روز هفته، قیمت و مدت هر خدمت را تنظیم کنید. نوبت‌های تکراری و هم‌زمان ساخته نمی‌شود.',
    },
    {
      icon: 'mobile',
      title: 'مناسب موبایل',
      text: 'همه‌چیز از گوشی قابل مدیریت است. نیازی به نصب برنامه یا ساخت حساب برای مشتری نیست.',
    },
  ];

  protected readonly steps: Step[] = [
    { title: 'ثبت‌نام کنید', text: 'نام کسب‌وکار و آدرس اختصاصی خود را انتخاب کنید.' },
    { title: 'خدمات و ساعت‌ها را تنظیم کنید', text: 'خدمات، قیمت و ساعت کاری را یک بار وارد کنید.' },
    { title: 'لینک را برای مشتری‌ها بفرستید', text: 'لینک رزرو را در اینستاگرام، واتساپ یا کارت ویزیت بگذارید.' },
  ];

  protected readonly year = new Date().getFullYear();
}
