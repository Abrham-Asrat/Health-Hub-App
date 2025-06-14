import { Component } from '@angular/core';
import { BlogComponent } from "../../Reusable/blog/blog.component";

@Component({
  selector: 'app-l-blog',
  standalone: true,
  imports: [BlogComponent],
  templateUrl: './l-blog.component.html',
  styleUrl: './l-blog.component.css',
})
export class LBlogComponent {}
