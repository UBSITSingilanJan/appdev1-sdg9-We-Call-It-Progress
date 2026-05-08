import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.css']
})
export class AdminPanel implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    const container = document.querySelector('.home-container') as HTMLElement;
    if (container) {
      container.style.minHeight = window.innerHeight + 'px';
    }
  }

  go(route: string) {
    this.router.navigate([`/${route}`]);
  }
}