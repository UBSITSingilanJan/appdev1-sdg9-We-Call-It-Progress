import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    const container = document.querySelector('.intro-container') as HTMLElement;
    if (container) {
      container.style.minHeight = window.innerHeight + 'px';
    }
  }

  goToAdmin() {
    this.router.navigate(['/admin-panel']);
  }
}