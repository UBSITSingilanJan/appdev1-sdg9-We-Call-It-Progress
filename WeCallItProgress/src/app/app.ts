import { Component, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from './nav-bar/nav-bar';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBar],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements AfterViewInit {
  title = 'We Call It Progress';

  ngAfterViewInit() {
    // Force check for scroll
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      console.log('Main content height:', mainContent.scrollHeight);
      console.log('Main content client height:', mainContent.clientHeight);
    }
  }
}