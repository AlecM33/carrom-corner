import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {PlayerService} from '../../Services/player.service';
import {HttpClient} from '@angular/common/http';
import {TournamentService} from '../../Services/tournament.service';
import {BracketService} from '../../Services/bracket.service';
import {GameService} from '../../Services/game.service';
import {TournamentSetupService} from '../../Services/tournament-setup.service';
import {Player} from '../../Players/player';
import {PlayerRecord} from '../../Records/player-record';
import {SinglesGame} from '../../Games/singles-game';
import {DoublesGame} from '../../Games/doubles-game';
import {Team} from '../../Teams/team';
import {TeamService} from '../../Services/team.service';

@Component({
  selector: 'app-view-round',
  templateUrl: './view-round.component.html',
  styleUrls: ['./view-round.component.css']
})
export class ViewRoundComponent implements OnInit {

  public tournyType: string;
  public players: Player[];
  public teams: Team[];
  public tournamentId: number;
  public currentRound: number;
  public numberOfRounds: number;
  public tournamentName: string;
  public playerPools = [];
  public recordPools = undefined;
  public roundId: number;
  public allGamesPlayed = false;
  public selectingAdvancements = false;
  public numberToAdvance = 1;
  public extraPlayer = false;
  public gamePools = [];
  public tournamentSize: number;
  public tournament = undefined;

  @ViewChild('roundModal') roundModal: ElementRef;

  constructor(public _playerService: PlayerService,
              public http: HttpClient,
              public active_route: ActivatedRoute,
              public router: Router,
              public _setupService: TournamentSetupService,
              public _tournamentService: TournamentService,
              public _gameService: GameService,
              public _teamService: TeamService
              ) { }

  ngOnInit() {
    this.recordPools = [];
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.tournyType = this.active_route.snapshot.paramMap.get('type');
        this.tournamentName = this.active_route.snapshot.paramMap.get('name');
        this.tournamentId = parseInt(this.active_route.snapshot.paramMap.get('tourny_id'), 10);
        this.currentRound = parseInt(this.active_route.snapshot.paramMap.get('round'), 10);
      }
    });
    this.tournyType = this.active_route.snapshot.paramMap.get('type');
    this.tournamentName = this.active_route.snapshot.paramMap.get('name');
    this.tournamentId = parseInt(this.active_route.snapshot.paramMap.get('tourny_id'), 10);
    this.currentRound = parseInt(this.active_route.snapshot.paramMap.get('round'), 10);
    this.retrieveRound();
  }

  retrieveRound() {
    console.log(this.currentRound);
    this._tournamentService.getTournament(this.tournamentId, this.tournyType).subscribe((tournament) => {
      this.tournament = tournament;
      this.numberOfRounds = tournament[0]['rounds'];
      this.tournamentSize = tournament[0]['size'];
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
    });
  }

  retrieveSinglesData() {
    this._setupService.getSinglesRound(this.tournamentId, this.tournament[0]['current_round']).subscribe((round) => {
      this.roundId = round[0]['id'];
      this._setupService.getSinglesPools(round[0]['id']).subscribe((poolsResponse: any) => {
        for (const pool of poolsResponse) {
          const poolId = pool['id'];
          this._setupService.getSinglesPoolPlacements(pool['id']).subscribe((placements: any) => {
            const playerRecords: PlayerRecord[] = [];
            for (const placement of placements) {
              playerRecords.push(new PlayerRecord(poolId, placement['player_id'], null));
            }
            this.recordPools.push(playerRecords);
          });
          this._gameService.getSinglesGamesInPool(poolId, this.tournamentId, this.roundId).subscribe((games) => {
            this.allGamesPlayed = !games.find((game) => !game.winner);
            this.gamePools.push(games);
            this.calculatePlayerRecords(games);
            this.sortPools();
          });
        }
      });
    });
  }

  sortPools() {
    for (const pool of this.recordPools) {
      pool.sort((a, b) => {
          if(a.wins > b.wins) return -1;
          if(b.wins > a.wins) return 1;
          if(a.losses < b.losses) return -1;
          if(b.losses > a.losses) return 1;
          return a.totalDiff >= b.totalDiff ? -1 : 1;
        }
      );
    }
  }

  retrieveDoublesData() {
    this._setupService.getDoublesRound(this.tournamentId, this.tournament[0]['current_round']).subscribe((round) => {
      this.roundId = round[0]['id'];
      this._setupService.getDoublesPools(this.roundId).subscribe((poolsResponse: any) => {
        for (const pool of poolsResponse) {
          const poolId = pool['id'];
          this._setupService.getDoublesPoolPlacements(pool['id']).subscribe((placements: any) => {
            const playerRecords: PlayerRecord[] = [];
            for (const placement of placements) {
              playerRecords.push(new PlayerRecord(poolId, null, placement['team_id']));
            }
            this.recordPools.push(playerRecords);
          });
          this._gameService.getDoublesGamesInPool(poolId, this.tournamentId, this.roundId).subscribe((games) => {
            this.allGamesPlayed = !games.find((game) => !game.winner);
            this.gamePools.push(games);
            this.calculateTeamRecords(games);
            this.sortPools();
          });
        }
      });
    });
  }

  calculatePlayerRecords(games: SinglesGame[]) {
    for (const game of games) {
      if (game.winner) {
        const playerPool = this.recordPools.find((pool) => pool.find((record) => record.playerId === game.winner));
        const winningPlayerIndex = playerPool.findIndex((record) => record.playerId === game.winner);
        const losingPlayerIndex = playerPool.findIndex((record) => record.playerId === game.loser);

        playerPool[winningPlayerIndex].wins++;
        playerPool[winningPlayerIndex].totalDiff += game.differential;
        playerPool[losingPlayerIndex].losses++;
        playerPool[losingPlayerIndex].totalDiff -= game.differential;
      }
    }
  }

  calculateTeamRecords(games: DoublesGame[]) {
    for (const game of games) {
      if (game.winner) {
        const teamPool = this.recordPools.find((pool) => pool.find((record) => record.teamId === game.winner));
        const winningTeamIndex = teamPool.findIndex((record) => record.teamId === game.winner);
        const losingTeamIndex = teamPool.findIndex((record) => record.teamId === game.loser);

        teamPool[winningTeamIndex].wins++;
        teamPool[winningTeamIndex].totalDiff += game.differential;
        teamPool[losingTeamIndex].losses++;
        teamPool[losingTeamIndex].totalDiff -= game.differential;
      }
    }
  }

  setRoundAdvancements(plusOrMinus: string) {
    if (plusOrMinus === 'plus') {
      if (this.numberToAdvance < this.findLargestPool()) {
        this.numberToAdvance += 1;
      }
    } else {
      if (this.numberToAdvance > 1) {
        this.numberToAdvance -= 1;
      }
    }
    console.log(this.numberToAdvance);
  }

  changeExtraPlayerChoice() {
    this.extraPlayer = !this.extraPlayer;
    console.log(this.extraPlayer);
  }

  findLargestPool() {
    let largest = 0;
    for (const pool of this.recordPools) {
      if (pool.length > largest) {
        largest = pool.length;
      }
    }
    return largest;
  }

  hideModal() {
    this.roundModal.nativeElement.className = 'modal hidden';
  }

  getLetter(index: number): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return alphabet[index];
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

  routeToPool(poolId: number, letter: string) {
    this.router.navigateByUrl('/tournaments/' + this.tournyType + '/' + this.tournamentName + '/' + this.tournamentId + '/' +
      this.currentRound + '/' + this.roundId + '/' + poolId + '/' + letter);
  }

  openModal() {
    this.roundModal.nativeElement.className = 'modal';
  }

  startNextRound() {
    this.roundModal.nativeElement.className = 'modal hidden';
    let roundUpdateObs;
    this.tournyType === 'singles' ?
      roundUpdateObs = this._tournamentService.updateSinglesTournamentRound(this.tournament[0].id, 2)
      : roundUpdateObs = this._tournamentService.updateDoublesTournamentRound(this.tournament[0].id, 2);
    roundUpdateObs.subscribe((resp) => {
      const nextRoundAdvancers = new Set();
      for (const pool of this.recordPools) {
        for (let i = 0; i < this.numberToAdvance; i++) {
          this.tournyType === 'singles' ?
            nextRoundAdvancers.add(this.players.find((player) => player.id === pool[i].playerId))
            : nextRoundAdvancers.add(this.teams.find((team) => team.id === pool[i].teamId));
        }
        if (pool.length === this.findLargestPool() && this.extraPlayer === true) {
          nextRoundAdvancers.add(pool[0]);
        }
      }
      console.log(nextRoundAdvancers);
      this.tournyType === 'singles' ?
        this._setupService.createSinglesData(this.tournamentId, this.tournamentName, 2, nextRoundAdvancers)
        : this._setupService.createDoublesData(this.tournamentId, this.tournamentName, 2, nextRoundAdvancers);
      this.ngOnInit();
    });
  }

  // Gets a random integer in the specified range (inclusive)
  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Function that simulates all tournament games for testing
  simulate() {
    for (const pool of this.gamePools) {
      for (let i = 0; i < pool.length; i++) {
        let winner;
        if (this.tournyType === 'singles') {
          this.getRandomIntInclusive(1, 2) === 1 ? winner = pool[i].player1Id : winner = pool[i].player2Id;
          if (winner === pool[i].player1Id) {
            pool[i].winner = pool[i].player1Id;
            pool[i].loser = pool[i].player2Id;
          } else {
            pool[i].winner = pool[i].player2Id;
            pool[i].loser = pool[i].player1Id;
          }
        } else {
          this.getRandomIntInclusive(1, 2) === 1 ? winner = pool[i].team1Id : winner = pool[i].team2Id;
          if (winner === pool[i].team1Id) {
            pool[i].winner = pool[i].team1Id;
            pool[i].loser = pool[i].team2Id;
          } else {
            pool[i].winner = pool[i].team2Id;
            pool[i].loser = pool[i].team1Id;
          }
        }
        pool[i].differential = this.getRandomIntInclusive(1, 11);
        this.tournyType === 'singles' ? this._gameService.updateSinglesGame(pool[i]).subscribe()
          : this._gameService.updateDoublesGame(pool[i]).subscribe();
      }
      this.tournyType === 'singles' ? this.calculatePlayerRecords(pool) : this.calculateTeamRecords(pool);
      this.allGamesPlayed = !pool.find((game) => !game.winner);
      this.sortPools();
    }
  }

}
