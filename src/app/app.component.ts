import { Component } from '@angular/core';
import { PlayerService } from './Services/player.service';
import { TournamentService } from './Services/tournament.service';
import {TournamentSetupService} from './Services/tournament-setup.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [PlayerService, TournamentService, TournamentSetupService]
})
export class AppComponent {
  title = 'Carrom Corner';
}
