import { Component } from '@angular/core';

import { HomeComponent } from '../../Reusable/home/home.component';

@Component({
  selector: 'app-p-home',
  standalone: true,
  imports: [HomeComponent],
  templateUrl: './p-home.component.html',
  styleUrls: ['./p-home.component.css'],
})
export class PHomeComponent {}
