import { Component, OnInit } from '@angular/core';
import {GameService} from '../Services/game.service';
import {DoublesGame} from '../Games/doubles-game';
import {SinglesGame} from '../Games/singles-game';

@Component({
    templateUrl: 'homepage-component.html'
})
export class HomepageComponent implements OnInit {

    constructor(public _gameService: GameService) {
    }

    public playedSinglesGames: SinglesGame[];
    public playedDoublesGames: DoublesGame[];
    public singlesValidatorPct: number;
    public doublesValidatorPct: number;
    public singlesCoinFlipPct: number;
    public doublesCoinFlipPct: number;

    ngOnInit() {
      this._gameService.getPlayedSinglesGames().subscribe((games) => {
        this.playedSinglesGames = games;
        this._gameService.getPlayedDoublesGames().subscribe((games) => {
          this.playedDoublesGames = games;
          if (this.playedSinglesGames && this.playedDoublesGames) {
            this.calculateWinPercentages();
          }
        });
      });
    }

    calculateWinPercentages() {
      this.singlesValidatorPct = this.playedSinglesGames.filter((game) => game.validator === game.winner).length
        / this.playedSinglesGames.length;
      this.doublesValidatorPct = this.playedDoublesGames.filter((game) => game.validator === game.winner).length
        / this.playedDoublesGames.length;
      this.singlesCoinFlipPct = this.playedSinglesGames.filter((game) => game.coinFlipWinner === game.winner).length
        / this.playedSinglesGames.length;
      this.doublesCoinFlipPct = this.playedDoublesGames.filter((game) => game.coinFlipWinner === game.winner).length
        / this.playedDoublesGames.length;
    }
}
