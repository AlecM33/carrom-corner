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
import {concatMap} from 'rxjs/operators';
import {tap} from 'rxjs/operators';
import {forkJoin} from 'rxjs/observable/forkJoin';

@Component({
  selector: 'cr-players',
  templateUrl: './player-list.component.html',
})


export class PlayerListComponent implements OnInit {

  public players = [];
  public newPlayers = [];
  public sortablePlayers = [];
  public loading = true;
  public statChoice = 'total';

  constructor(private _playerService: PlayerService, private http: HttpClient, public _gameService: GameService, public _teamService: TeamService) {}

  // gets player list for list view
  ngOnInit() {
    this._playerService.getPlayers(true).subscribe((players) => {
      this.players = players;
      console.log(this.players);
      //this.sortPlayers();
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

  changeStatFilter(filter) {
    this.statChoice = filter;
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
    for (const player of this.players) {
      const singlesDoublesObservables: Observable<Object>[] = [];
      singlesDoublesObservables.push(this.fetchCalculatedSinglesStats(player));
      singlesDoublesObservables.push(this.fetchCalculatedDoublesStats(player));
      forkJoin(...singlesDoublesObservables).subscribe((result) => {
        player.totalWins = player.singlesWins + player.doublesWins;
        player.totalLosses = player.singlesLosses + player.doublesLosses;
        player.totalWinPtg = this.setTotalWinPtg(player.singlesWinPtg, player.doublesWinPtg);
        player.totalAvgDiff = this.setTotalAvgDiff(player.singlesAvgDiff, player.doublesAvgDiff);
        this.loading = false;
      });
    }
  }

  setTotalWinPtg(singlesPtg, doublesPtg) {
    if (!singlesPtg && ! doublesPtg) { return undefined; }
    if (singlesPtg && !doublesPtg) { return singlesPtg; }
    if (!singlesPtg && doublesPtg) { return doublesPtg; }
    if (singlesPtg && doublesPtg) { return (singlesPtg + doublesPtg) / 2; }
  }

  setTotalAvgDiff(singlesDiff, doublesDiff) {
    if (!singlesDiff && ! doublesDiff) { return undefined; }
    if (singlesDiff && !doublesDiff) { return singlesDiff; }
    if (!singlesDiff && doublesDiff) { return doublesDiff; }
    if (singlesDiff && doublesDiff) { return (singlesDiff + doublesDiff) / 2; }
  }

  fetchCalculatedSinglesStats(player): Observable<any> {
    return this._gameService.getPlayerSinglesWinsAndLosses(player.id).pipe(tap((result) => {
      player.singlesWins = result[0].win_count;
      player.singlesLosses = result[0].loss_count;
      player.singlesWinPtg = (player.singlesWins + player.singlesLosses) > 0 ? player.singlesWins / (player.singlesWins + player.singlesLosses) : undefined;
      player.singlesAvgDiff = (player.singlesWins + player.singlesLosses) > 0 ? ((result[0].plus + result[0].minus) / (player.singlesWins + player.singlesLosses)) : undefined;
    }));
  }

  fetchCalculatedDoublesStats(player): Observable<any> {
    return this._teamService.getPlayerTeams(player.id).pipe(concatMap((teams) => {
      player.doublesWins = 0;
      player.doublesLosses = 0;
      player.doublesWinPtg = 0;
      player.doublesAvgDiff = 0;
      const observablesArray: Observable<Object>[] = [];
      for (const team of teams) {
        observablesArray.push(this._gameService.getPlayerDoublesWinsAndLosses(team.id));
      }
      return forkJoin(...observablesArray).pipe(tap((teamRecords) => {
        let totalPlus = 0, totalMinus = 0;
        for (const record of teamRecords) {
          player.doublesWins += record[0].win_count;
          player.doublesLosses += record[0].loss_count;
          totalPlus += record[0].plus;
          totalMinus += record[0].minus;
        }
        player.doublesWinPtg = (player.doublesWins + player.doublesLosses) > 0
          ? player.doublesWins / (player.doublesWins + player.doublesLosses)
          : undefined;
        player.doublesAvgDiff = (player.doublesWins + player.doublesLosses) > 0
          ? ((totalPlus + totalMinus) / (player.doublesWins + player.doublesLosses))
          : undefined;
      }));
    }));
  }
}
