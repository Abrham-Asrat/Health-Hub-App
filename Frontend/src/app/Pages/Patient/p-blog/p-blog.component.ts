import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { LoginComponent } from "../../Landing/log-in/log-in.component";
import { BlogComponent } from "../../Reusable/blog/blog.component";

@Component({
  selector: 'app-p-blog',
  standalone: true,
  imports: [BlogComponent],
  templateUrl: './p-blog.component.html',
  styleUrl: './p-blog.component.css',
})
export class PBlogComponent {}

