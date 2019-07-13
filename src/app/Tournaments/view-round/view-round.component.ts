import { Component, OnInit } from '@angular/core';
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
  public tournamentName: string;
  public playerPools = [];
  public recordPools = [];
  public roundId: number;

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
    this.tournamentName = this.active_route.snapshot.paramMap.get('name');
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.tournyType = this.active_route.snapshot.paramMap.get('type');
      }
    });
    this.tournamentId = parseInt(this.active_route.snapshot.paramMap.get('tourny_id'), 10);
    this.currentRound = parseInt(this.active_route.snapshot.paramMap.get('round'), 10);
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

  retrieveSinglesData() {
    this._setupService.getFirstSinglesRound(this.tournamentId).subscribe((round) => {
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
    this._setupService.getFirstDoublesRound(this.tournamentId).subscribe((round) => {
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
        let playerPool = this.recordPools.find((pool) => pool.find((record) => record.playerId === game.winner));
        let winningPlayerIndex = playerPool.findIndex((record) => record.playerId === game.winner);
        let losingPlayerIndex = playerPool.findIndex((record) => record.playerId === game.loser);

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
        let teamPool = this.recordPools.find((pool) => pool.find((record) => record.teamId === game.winner));
        let winningTeamIndex = teamPool.findIndex((record) => record.teamId === game.winner);
        let losingTeamIndex = teamPool.findIndex((record) => record.teamId === game.loser);

        teamPool[winningTeamIndex].wins++;
        teamPool[winningTeamIndex].totalDiff += game.differential;
        teamPool[losingTeamIndex].losses++;
        teamPool[losingTeamIndex].totalDiff -= game.differential;
      }
    }
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

}
