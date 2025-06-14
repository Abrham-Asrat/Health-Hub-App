import { Component } from '@angular/core';
import { BlogComponent } from '../../Reusable/blog/blog.component';

@Component({
  selector: 'app-d-blog',
  standalone: true,
  imports: [BlogComponent],
  templateUrl: './d-blog.component.html',
  styleUrl: './d-blog.component.css',
})
export class DBlogComponent {}
