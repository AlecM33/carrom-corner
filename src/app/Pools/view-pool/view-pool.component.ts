import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {PlayerRecord} from '../../Records/player-record';
import {Player} from '../../Players/player';
import {Team} from '../../Teams/team';
import {PlayerService} from '../../Services/player.service';
import {HttpClient} from '@angular/common/http';
import {TournamentSetupService} from '../../Services/tournament-setup.service';
import {GameService} from '../../Services/game.service';
import {TeamService} from '../../Services/team.service';
import {SinglesGame} from '../../Games/singles-game';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-view-pool',
  templateUrl: './view-pool.component.html',
  styleUrls: ['./view-pool.component.css']
})
export class ViewPoolComponent implements OnInit {

  public tournyType: string;
  public players: Player[];
  public teams: Team[];
  public tournamentId: number;
  public currentRound: number;
  public tournamentName: string;
  public poolId: number;
  public roundId: number;
  public poolGames = [];
  public letter: string;
  public playersInPool = [];
  public currentGame = undefined;
  public gameWinner: any;

  constructor(public _playerService: PlayerService,
              public http: HttpClient,
              public active_route: ActivatedRoute,
              public router: Router,
              public _setupService: TournamentSetupService,
              public _gameService: GameService,
              public _teamService: TeamService
  ) { }

  ngOnInit() {
    this.tournyType = this.active_route.snapshot.paramMap.get('type');
    this.letter = this.active_route.snapshot.paramMap.get('letter');
    this.tournamentName = this.active_route.snapshot.paramMap.get('name');
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.tournyType = this.active_route.snapshot.paramMap.get('type');
      }
    });
    this.tournamentId = parseInt(this.active_route.snapshot.paramMap.get('tourny_id'), 10);
    this.roundId = parseInt(this.active_route.snapshot.paramMap.get('round_id'), 10);
    this.poolId = parseInt(this.active_route.snapshot.paramMap.get('pool_id'), 10);
    this._playerService.getPlayers().subscribe((players) => {
      this.players = players;
      if (this.tournyType === 'singles') {
        this.players = players;
        this.retrieveSinglesData();
      } else {
        this._teamService.getTeams(this.tournamentId).subscribe((teams) => {
          this.teams = teams;
          console.log(teams);
          this.retrieveDoublesData();
        });
      }
    });
  }

  retrieveSinglesData() {
    this._gameService.getSinglesGamesInPool(this.poolId, this.tournamentId, this.roundId).subscribe((games) => {
      this.poolGames = games;
      this.getPoolPlayers();
    });
  }

  retrieveDoublesData() {
    // this._gameService.getDoublesGamesInPool(this.poolId, this.tournamentId, this.roundId).subscribe((games) => {
    //   this.poolGames = games;
    //   this.getPoolTeams(this.poolGames);
    // });
  }

  getPoolPlayers() {
    for (const game of this.poolGames) {
      const player1 = this.players.find((player) => player.id === game.player1Id);
      const player2 = this.players.find((player) => player.id === game.player2Id);
      if (!this.playersInPool.includes(player1)) {
        this.playersInPool.push(player1);
      }
      if (!this.playersInPool.includes(player2)) {
        this.playersInPool.push(player2);
      }
    }
    console.log(this.playersInPool);
  }

  gameIsPlayed(player1Id: number, player2Id: number) {
    const game = this.poolGames.find((game) => game.player1Id === player1Id && game.player2Id === player2Id);
    return game && game.winner && game.differential;
  }

  setCurrentGame(player1Id: number, player2Id: number) {
    this.currentGame = this.poolGames.find((game) => game.player1Id === player1Id && game.player2Id === player2Id);
    console.log(this.currentGame);
  }

  setGameWinner(winnerId: number, loserId: number) {
    this.currentGame.winner = winnerId;
    this.currentGame.loser = loserId;
  }

  setGameDifferential(plusOrMinus: string) {
    if (plusOrMinus === 'plus') {
      if (this.currentGame.differential < 11) {
        this.currentGame.differential += 1;
      }
    } else {
      if (this.currentGame.differential > 1) {
        this.currentGame.differential -= 1;
      }
    }
  }

  // Function for validating form
  validateGame() {
    return !(this.currentGame.winner === undefined) && !(this.currentGame.differential === undefined);
  }

  submitGame() {
    if (this.validateGame()) {
      console.log('here');
      this._gameService.updateSinglesGame(this.currentGame).subscribe(() => {
        console.log(this.currentGame);
          if (this.tournyType === 'doubles') {
            //this.patchDoublesPlayers();
          } else {
            //this.patchSinglesPlayers();
          }
      });
    }
  }

  // Gets a random integer in the specified range (inclusive)
  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  returnArrayOfLength(length) {
    return new Array(length);
  }

  convertToName(id) {
    if (this.tournyType === 'singles') {
      return this.players.find((player) => player.id === id).name;
    } else {
      console.log(this.teams);
      const foundTeam = this.teams.find((team) => team.id === id);
      return this.players.find((player) => player.id === foundTeam.player1Id).name
        + ', ' + this.players.find((player) => player.id === foundTeam.player2Id).name;
      // TODO: fetch teams in doubles tournament and map to names;
    }
  }

}
