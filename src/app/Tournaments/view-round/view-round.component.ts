import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {PlayerService} from '../../Services/player.service';
import {HttpClient} from '@angular/common/http';
import {TournamentService} from '../../Services/tournament.service';
import {BracketService} from '../../Services/bracket.service';
import {GameService} from '../../Services/game.service';
import {TournamentSetupService} from '../../Services/tournament-setup.service';
import {Player} from '../../Players/player';

@Component({
  selector: 'app-view-round',
  templateUrl: './view-round.component.html',
  styleUrls: ['./view-round.component.css']
})
export class ViewRoundComponent implements OnInit {

  public tournyType: string;
  public players: Player[];
  public tournamentId: number;
  public currentRound: number;
  public tournamentName: string;
  public playerPools = [];

  constructor(public _playerService: PlayerService,
              public http: HttpClient,
              public active_route: ActivatedRoute,
              public router: Router,
              public _setupService: TournamentSetupService,
              public _tournyService: TournamentService,
              public _bracketService: BracketService,
              public _gameService: GameService
              ) { }

  ngOnInit() {
    this.tournyType = this.active_route.snapshot.paramMap.get('type');
    this.tournamentName = this.active_route.snapshot.paramMap.get('name');
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.tournyType = this.active_route.snapshot.paramMap.get('type');
      }
    });
    this.tournamentId = parseInt(this.active_route.snapshot.paramMap.get('id'), 10);
    this.currentRound = parseInt(this.active_route.snapshot.paramMap.get('round'), 10);
    this._playerService.getPlayers().subscribe((players) => {
      this.players = players;
      if (this.tournyType === 'singles') {
        this.retrieveSinglesData();
      } else {
        this.retrieveDoublesData();
      }
    });
  }

  retrieveSinglesData() {
    this._setupService.getFirstSinglesRound(this.tournamentId).subscribe((round) => {
      const roundId = round[0]['id'];
      this._setupService.getSinglesPools(round[0]['id']).subscribe((poolsResponse: any) => {
        for (const pool of poolsResponse) {
          const poolId = pool['id'];
          this._setupService.getSinglesPoolPlacements(pool['id']).subscribe((placements: any) => {
            const playerIds = [];
            for (const placement of placements) {
              playerIds.push(placement['player_id']);
            }
            this.playerPools.push(playerIds);
            //this._setupService.generateSinglesRoundRobinGameSet(placements, this.tournamentId, roundId, poolId);
          });
        }
        console.log(this.playerPools);
      });
    });
  }

  retrieveDoublesData() {
    this._setupService.getFirstDoublesRound(this.tournamentId).subscribe((round) => {
      const roundId = round[0]['id'];
      this._setupService.getDoublesPools(round[0]['id']).subscribe((poolsResponse: any) => {
        for (const pool of poolsResponse) {
          const poolId = pool['id'];
          this._setupService.getDoublesPoolPlacements(pool['id']).subscribe((placements) => {
            this._setupService.generateDoublesRoundRobinGameSet(placements, this.tournamentId, roundId, poolId);
          });
        }
      });
    });
  }

  getLetter(index: number): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return alphabet[index];
  }

  convertToName(id) {
    if (this.tournyType === 'singles') {
      return this.players.find((player) => player.id === id).name;
    } else {
      // TODO: fetch teams in doubles tournament;
    }
  }

}
