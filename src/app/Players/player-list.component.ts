import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../Services/player.service';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

@Component({
  selector: 'cr-players',
  templateUrl: './player-list.component.html',
})

export class PlayerListComponent implements OnInit {

  public players = [];
  public newPlayers = [];
  public sortablePlayers = [];

  constructor(private _playerService: PlayerService, private http: HttpClient) {}

   // gets player list for list view
   ngOnInit() {
    this._playerService.getPlayers().subscribe((players) => {
      this.players = players;
      this.sortablePlayers = this.players.filter((player) => player.singlesPlayed > 0 || player.doublesPlayed > 0);
      this.newPlayers = this.players.filter((player) => player.singlesPlayed === 0 && player.doublesPlayed === 0);
      this.sortPlayers();
    });
  }

  // calls the delete function from the player service, refreshes the player list
  delete(player) {
      this.players = [];
      this._playerService.deletePlayer(player).do(() => {
        this._playerService.getPlayers().subscribe((players) => {
          this.players = players;
          this.sortablePlayers = this.players.filter((eachPlayer) => eachPlayer.singlesPlayed > 0 || eachPlayer.doublesPlayed > 0);
          this.newPlayers = this.players.filter((eachPlayer) => eachPlayer.singlesPlayed === 0 && eachPlayer.doublesPlayed === 0);
        });
      }).subscribe();
  }

  // Sorts players by an average of their singles and doubles elo
  sortPlayers() {
    this.sortablePlayers.sort((a, b) => {
      let aAvg = (a.elo + a.doublesElo) / 2;
      let bAvg = (b.elo + b.doublesElo) / 2;
      if (b.gamesPlayed === 0) {
        return 1;
      } else if (aAvg > bAvg) {
        return -1;
      } else if (aAvg === bAvg) {
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
}
