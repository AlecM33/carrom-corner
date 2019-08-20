import { Component, OnInit } from '@angular/core';
import {GameService} from '../Services/game.service';
import {DoublesGame} from '../Games/doubles-game';
import {SinglesGame} from '../Games/singles-game';

@Component({
    templateUrl: 'homepage-component.html'
})
export class HomepageComponent implements OnInit {

    constructor(public _gameService: GameService) {
      this.playedSinglesGames = [];
      this.playedDoublesGames = [];
    }

    public playedSinglesGames: SinglesGame[];
    public playedDoublesGames: DoublesGame[];
    public singlesValidatorPct: number;
    public doublesValidatorPct: number;
    public singlesCoinFlipPct: number;
    public doublesCoinFlipPct: number;
    public singlesCoinsSank = 0;
    public doublesCoinsSank = 0;
    public singlesAvgDiff;
    public doublesAvgDiff;
    public totalAvgDiff;
    public totalValidatorPct;
    public totalCoinFlipPct;
    public loading = true;
    public noGamesPlayed = false;
    public totalGamesPlayed = 0;

    ngOnInit() {
      this._gameService.getPlayedSinglesGames().subscribe((games) => {
        this.playedSinglesGames = games;
        this._gameService.getPlayedDoublesGames().subscribe((games2) => {
          this.playedDoublesGames = games2;
          if (this.playedSinglesGames && this.playedDoublesGames) {
            if (this.playedSinglesGames.length === 0 && this.playedDoublesGames.length === 0) {
              this.noGamesPlayed = true;
            }
            this.totalGamesPlayed = this.playedSinglesGames.length + this.playedDoublesGames.length;
            this.calculateTotalStats();
            this.calculateWinPercentages();
            this.loading = false;
          }
        });
      });
    }

    calculateWinPercentages() {
      if (this.playedSinglesGames && this.playedSinglesGames.length > 0) {
        this.singlesValidatorPct = this.playedSinglesGames.filter((game) => game.validator === game.winner).length
          / this.playedSinglesGames.length;
        this.singlesCoinFlipPct = this.playedSinglesGames.filter((game) => game.coinFlipWinner === game.winner).length
          / this.playedSinglesGames.length;
      }
      if (this.playedDoublesGames && this.playedDoublesGames.length > 0) {
        this.doublesValidatorPct = this.playedDoublesGames.filter((game) => game.validator === game.winner).length
          / this.playedDoublesGames.length;
        this.doublesCoinFlipPct = this.playedDoublesGames.filter((game) => game.coinFlipWinner === game.winner).length
          / this.playedDoublesGames.length;
      }
      this.totalValidatorPct = this.setTotalValidationPtc(this.singlesValidatorPct, this.doublesValidatorPct);
      this.totalCoinFlipPct = this.setTotalCoinFlipPtc(this.singlesCoinFlipPct, this.doublesCoinFlipPct);
      this.totalAvgDiff = this.setTotalAvgDiff(this.singlesAvgDiff, this.doublesAvgDiff);
    }

  setTotalValidationPtc(singlesPtc, doublesPtc) {
    if (!(typeof singlesPtc === 'number') && !(typeof doublesPtc === 'number')) { return undefined; }
    if (typeof singlesPtc === 'number' && !(typeof doublesPtc === 'number')) { return singlesPtc; }
    if (!(typeof singlesPtc === 'number') && typeof doublesPtc === 'number') { return doublesPtc; }
    if (typeof singlesPtc === 'number' && typeof doublesPtc === 'number') {
      return ((singlesPtc * (this.playedSinglesGames.length / this.totalGamesPlayed))
        + (doublesPtc * (this.playedDoublesGames.length / this.totalGamesPlayed)));
    }
  }

  setTotalCoinFlipPtc(singlesPtc, doublesPtc) {
    if (!(typeof singlesPtc === 'number') && !(typeof doublesPtc === 'number')) { return undefined; }
    if (typeof singlesPtc === 'number' && !(typeof doublesPtc === 'number')) { return singlesPtc; }
    if (!(typeof singlesPtc === 'number') && typeof doublesPtc === 'number') { return doublesPtc; }
    if (typeof singlesPtc === 'number' && typeof doublesPtc === 'number') {
      return ((singlesPtc * (this.playedSinglesGames.length / this.totalGamesPlayed))
        + (doublesPtc * (this.playedDoublesGames.length / this.totalGamesPlayed)));
    }
  }

  setTotalAvgDiff(singlesDiff, doublesDiff) {
    if (!(typeof singlesDiff === 'number') && !(typeof doublesDiff === 'number')) { return undefined; }
    if (typeof singlesDiff === 'number' && !(typeof doublesDiff === 'number')) { return singlesDiff; }
    if (!(typeof singlesDiff === 'number') && typeof doublesDiff === 'number') { return doublesDiff; }
    if (typeof singlesDiff === 'number' && typeof doublesDiff === 'number') {
      return ((singlesDiff * (this.playedSinglesGames.length / this.totalGamesPlayed))
        + (doublesDiff * (this.playedDoublesGames.length / this.totalGamesPlayed)));
    }
  }

  calculateTotalStats() {
    let singlesTotalDiff = 0, doublesTotalDiff = 0;
    for (const game of this.playedSinglesGames) {
      if (game.winner === game.validator) {
        this.singlesCoinsSank += (10 + (9 - (game.differential - 2)));

      } else {
        this.singlesCoinsSank += (9 + (10 - (game.differential + 2)));
      }
      singlesTotalDiff += game.differential;
    }
    for (const game of this.playedDoublesGames) {
      if (game.winner === game.validator) {
        this.doublesCoinsSank += (10 + (9 - (game.differential - 2)));
      } else {
        this.doublesCoinsSank += (9 + (10 - (game.differential + 2)));
      }
      doublesTotalDiff += game.differential;
    }
    if (singlesTotalDiff) this.singlesAvgDiff = singlesTotalDiff / this.playedSinglesGames.length;
    if (doublesTotalDiff) this.doublesAvgDiff = doublesTotalDiff / this.playedDoublesGames.length;
  }
}
