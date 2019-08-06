import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
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
import {TournamentService} from '../../Services/tournament.service';

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
  public participantsInPool = [];
  public loading = true;
  public currentGame = undefined;
  public gameWinner: any;
  public robinType: string;

  @ViewChild('updateBtn') updateBtn: ElementRef;
  @ViewChild('poolModal') poolModal: ElementRef;


  constructor(public _playerService: PlayerService,
              public http: HttpClient,
              public active_route: ActivatedRoute,
              public router: Router,
              public _gameService: GameService,
              public _teamService: TeamService,
              public _tournyService: TournamentService
  ) { }

  ngOnInit() {
    this.tournyType = this.active_route.snapshot.paramMap.get('type');
    this.letter = this.active_route.snapshot.paramMap.get('letter');
    this.tournamentName = this.active_route.snapshot.paramMap.get('name');
    this.currentRound = parseInt(this.active_route.snapshot.paramMap.get('round'), 10);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.tournyType = this.active_route.snapshot.paramMap.get('type');
      }
    });
    this.tournamentId = parseInt(this.active_route.snapshot.paramMap.get('tourny_id'), 10);
    this._tournyService.getTournament(this.tournamentId, this.tournyType).subscribe((tourny) => {
      this.robinType = tourny[0]['robin_type'];
    });
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
          this.retrieveDoublesData();
        });
      }
    });
  }

  hideModal() {
    this.poolModal.nativeElement.className = 'modal hidden';
  }

  openModal() {
    this.updateBtn.nativeElement.innerText = 'Update Game';
    this.updateBtn.nativeElement.className = 'app-btn';
    this.poolModal.nativeElement.className = 'modal';
  }


  backToRound() {
    this.router.navigateByUrl('/tournaments/' + this.tournyType + '/' + this.tournamentName + '/' + this.tournamentId + '/' + this.currentRound);
  }

  retrieveSinglesData() {
    this._gameService.getSinglesGamesInPool(this.poolId, this.tournamentId, this.roundId).subscribe((games) => {
      this.poolGames = games;
      this.getPoolPlayers();
    });
  }

  retrieveDoublesData() {
    this._gameService.getDoublesGamesInPool(this.poolId, this.tournamentId, this.roundId).subscribe((games) => {
      this.poolGames = games;
      this.getPoolTeams();
    });
  }

  getPoolPlayers() {
    for (const game of this.poolGames) {
      const player1 = this.players.find((player) => player.id === game.player1Id);
      const player2 = this.players.find((player) => player.id === game.player2Id);
      if (!this.participantsInPool.includes(player1)) {
        this.participantsInPool.push(player1);
      }
      if (!this.participantsInPool.includes(player2)) {
        this.participantsInPool.push(player2);
      }
    }
    this.loading = false;
  }

  getPoolTeams() {
    for (const game of this.poolGames) {
      const team1 = this.teams.find((team) => team.id === game.team1Id);
      const team2 = this.teams.find((team) => team.id === game.team2Id);
      if (!this.participantsInPool.includes(team1)) {
        this.participantsInPool.push(team1);
      }
      if (!this.participantsInPool.includes(team2)) {
        this.participantsInPool.push(team2);
      }
    }
    this.loading = false;
  }

  gameIsPlayed(participant1Id: number, participant2Id: number) {
    let game;
    if (this.tournyType === 'singles') {
      game = this.poolGames.find((game) => game.player1Id === participant1Id && game.player2Id === participant2Id);
    } else {
      game = this.poolGames.find((game) => game.team1Id === participant1Id && game.team2Id === participant2Id);
    }
    return game && game.winner && game.differential;
  }

  setCurrentGame(participant1Id: number, participant2Id: number) {
    this.updateBtn.nativeElement.innerText = 'Update Game';
    this.updateBtn.nativeElement.className = 'app-btn';
    if (this.tournyType === 'singles') {
      this.currentGame = this.poolGames.find((game) => game.player1Id === participant1Id && game.player2Id === participant2Id);
    } else {
      this.currentGame = this.poolGames.find((game) => game.team1Id === participant1Id && game.team2Id === participant2Id);
    }
    this.openModal();
  }

  setGameWinner(winnerId: number, loserId: number) {
    this.updateBtn.nativeElement.innerText = 'Update Game';
    this.updateBtn.nativeElement.className = 'app-btn';
    this.currentGame.winner = winnerId;
    this.currentGame.loser = loserId;
  }

  setValidator(id) {
    this.updateBtn.nativeElement.innerText = 'Update Game';
    this.updateBtn.nativeElement.className = 'app-btn';
    this.currentGame.validator = id;
  }

  setFlipWinner(id) {
    this.updateBtn.nativeElement.innerText = 'Update Game';
    this.updateBtn.nativeElement.className = 'app-btn';
    this.currentGame.coinFlipWinner = id;
  }

  setGameDifferential(plusOrMinus: string) {
    this.updateBtn.nativeElement.innerText = 'Update Game';
    this.updateBtn.nativeElement.className = 'app-btn';
    if (plusOrMinus === 'plus') {
      if (this.currentGame.differential < 11) {
        this.currentGame.differential += 1;
      }
    } else {
      if (this.currentGame.differential > 0) {
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
      this.updateBtn.nativeElement.innerText = 'Updating...';
      this.updateBtn.nativeElement.className = 'app-btn';
      const call = this.tournyType === 'singles' ? this._gameService.updateSinglesGame(this.currentGame)
        : this._gameService.updateDoublesGame(this.currentGame);
      call.subscribe(() => {
          if (this.tournyType === 'doubles') {
            //this.patchDoublesPlayers();
          } else {
            //this.patchSinglesPlayers();
          }
        this.updateBtn.nativeElement.innerText = 'Updated';
        this.updateBtn.nativeElement.className = 'app-btn confirmed';
        this.hideModal();
      });
    }
  }

  // Gets a random integer in the specified range (inclusive)
  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  returnArrayBasedOnRobinType(length) {
    return this.robinType === 'Single' ?
      new Array(length)
      : new Array(this.participantsInPool.length);
  }

  convertToName(id) {
    if (this.tournyType === 'singles') {
      return this.players.find((player) => player.id === id).name;
    } else {
      const foundTeam = this.teams.find((team) => team.id === id);
      return this.players.find((player) => player.id === foundTeam.player1Id).name
        + ', ' + this.players.find((player) => player.id === foundTeam.player2Id).name;
      // TODO: fetch teams in doubles tournament and map to names;
    }
  }

}
