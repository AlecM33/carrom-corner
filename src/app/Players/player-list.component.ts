import { Component, OnInit } from '@angular/core';
import { Player } from './player';
import { HttpModule, JsonpModule } from '@angular/http';
import { PlayerService } from '../Services/player.service';
import { AppComponent } from '../app.component';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Config } from 'protractor';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import {GameService} from '../Services/game.service';
import {TeamService} from '../Services/team.service';

@Component({
  selector: 'cr-players',
  templateUrl: './player-list.component.html',
})


export class PlayerListComponent implements OnInit {

  public players = [];
  public newPlayers = [];
  public sortablePlayers = [];
  public loading = true;

  constructor(private _playerService: PlayerService, private http: HttpClient, public _gameService: GameService, public _teamService: TeamService) {}

  // gets player list for list view
  ngOnInit() {
    this._playerService.getPlayers().subscribe((players) => {
      this.players = players;
      this.sortPlayers();
      this.calculatePlayerStats();
    });
  }

  // calls the delete function from the player service, refreshes the player list
  delete(e, player) {
    e.preventDefault();
    this.players = [];
    this._playerService.deletePlayer(player).do(() => {
      this._playerService.getPlayers().subscribe((players) => {
        this.players = players;
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
    });
  }

  calculatePlayerStats() {
    if(this.players.length < 1) {
      this.loading = false;
      return;
    }
    for (const player of this.players) {
      this._gameService.getPlayedSinglesGames().subscribe((games) => {
        const playerSinglesGames = games.filter((game) => game.player1Id === player.id
          || game.player2Id === player.id);
        player.singlesPlayed = playerSinglesGames.length;
        for (const game of playerSinglesGames.filter((game2) => game2.winner === player.id)) {
          player.wins ++;
          player.totalDiff += game.differential;
        }
        for (const game of playerSinglesGames.filter((game3) => game3.winner !== player.id)) {
          player.losses ++;
          player.totalDiff -= game.differential;
        }
      });
      this._gameService.getPlayedDoublesGames().subscribe((games) => {
        this._teamService.getPlayerTeams(player.id).subscribe((teams) => {
          for (const team of teams) {
            const teamGames = games.filter((game) => game.team1Id === team.id
              || game.team2Id === team.id);
            player.doublesPlayed += teamGames.length;
            for (const game of teamGames.filter((game2) => game2.winner === team.id)) {
              player.wins ++;
              player.totalDiff += game.differential;
            }
            for (const game of teamGames.filter((game3) => game3.winner !== team.id)) {
              player.losses ++;
              player.totalDiff -= game.differential;
            }
          }
          this.loading = false;
        });
      });
    }
    this.sortablePlayers = this.players.filter((player) => player.singlesPlayed > 0 || player.doublesPlayed > 0);
    this.newPlayers = this.players.filter((player) => player.singlesPlayed === 0 && player.doublesPlayed === 0);
  }
}
