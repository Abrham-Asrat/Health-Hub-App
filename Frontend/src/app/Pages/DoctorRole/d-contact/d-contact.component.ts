import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactComponent } from '../../Reusable/contact/contact.component';

@Component({
  selector: 'app-d-contact',
  imports: [ContactComponent],
  templateUrl: './d-contact.component.html',
  styleUrl: './d-contact.component.css',
})
export class DContactComponent {}
