import { Component } from '@angular/core';
import { PlayerService } from './Services/player.service';
import { TournamentService } from './Services/tournament.service';
import {TournamentSetupService} from './Services/tournament-setup.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [PlayerService, TournamentService, TournamentSetupService]
})
export class AppComponent {
  title = 'Carrom Corner';

  constructor(public _router: Router) {

  }
  public menu = false;

  toggleHamburgerMenu() {
    if (this.menu === true) {
      document.getElementById('mobile-menu').className = 'mobile-menu hidden';
      document.getElementById('hamburger').className = 'hamburger hamburger--collapse';
    } else {
      document.getElementById('mobile-menu').className = 'mobile-menu';
      document.getElementById('hamburger').className = 'hamburger hamburger--collapse is-active';
    }
    this.menu = !this.menu;
  }

  navigateAndCollapse(route) {
    this.menu = false;
    document.getElementById('mobile-menu').className = 'mobile-menu hidden';
    document.getElementById('hamburger').className = 'hamburger hamburger--collapse';
    this._router.navigateByUrl(route);
  }
}
