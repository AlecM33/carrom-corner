import { Component, OnInit } from '@angular/core';
import { Player } from './player';
import { HttpModule, JsonpModule } from '@angular/http';
import { PlayerService } from './player.service';
import { AppComponent } from '../app.component';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Config } from 'protractor';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

@Component({
  selector: 'cr-players',
  templateUrl: './player-list.component.html',
})

export class PlayerListComponent implements OnInit {

  public players = [];

  constructor(private _playerService: PlayerService, private http: HttpClient) { 
  }

  // calls the delete function from the player service, refreshes the player list
  delete(player) {
      this.players = [];
      this._playerService.deletePlayer(player).do(() => {
        this._playerService.getPlayers().subscribe((players) => {
          this.players = players;
        })
        }).subscribe();
  }

  sortPlayers() {
    this.players.sort((a, b) => {
      let aAvg = (a.elo + a.doublesElo) / 2;
      let bAvg = (b.elo + b.doublesElo) / 2;
      if (b.gamesPlayed == 0) {
        return -1;
      } else if (aAvg > bAvg) {
        return -1;
      } else if ((aAvg) == (bAvg)) {
          if (a.gamesPlayed >= b.gamesPlayed) {
            return -1;
          } else {
            return 1;
          }
      } else {
        return 1;
      }
    })
  }
  
  // gets player list for list view
  ngOnInit() {
    this._playerService.getPlayers().subscribe((players) => {
      this.players = players;
      this.sortPlayers();
    });
  }
}
