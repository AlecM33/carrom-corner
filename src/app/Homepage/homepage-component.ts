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
    public coinsSank = 0;
    public averageDiff = 0;

    ngOnInit() {
      this._gameService.getPlayedSinglesGames().subscribe((games) => {
        this.playedSinglesGames = games;
        this._gameService.getPlayedDoublesGames().subscribe((games2) => {
          this.playedDoublesGames = games2;
          if (this.playedSinglesGames && this.playedDoublesGames) {
            this.calculateWinPercentages();
            this.calculateTotalStats();
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

      if(this.playedDoublesGames && this.playedDoublesGames.length > 0) {
        this.doublesValidatorPct = this.playedDoublesGames.filter((game) => game.validator === game.winner).length
          / this.playedDoublesGames.length;
        this.doublesCoinFlipPct = this.playedDoublesGames.filter((game) => game.coinFlipWinner === game.winner).length
          / this.playedDoublesGames.length;
      }
    }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

    async calculateTotalStats() {
      let totalDiff = 0;
      for (const game of this.playedSinglesGames) {
        if (game.winner === game.validator) {
          this.coinsSank += (10 + (9 - (game.differential - 2)));

        } else {
          this.coinsSank += (9 + (10 - (game.differential + 2)));
        }
        totalDiff += game.differential;
      }
      for (const game of this.playedDoublesGames) {
        if (game.winner === game.validator) {
          this.coinsSank += (10 + (9 - (game.differential - 2)));
        } else {
          this.coinsSank += (9 + (10 - (game.differential + 2)));
        }
        totalDiff += game.differential;
      }
      this.averageDiff = totalDiff / (this.playedSinglesGames.length + this.playedDoublesGames.length);
    }
}
