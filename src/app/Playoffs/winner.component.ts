import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../Services/player.service';
import { TournamentService } from '../Services/tournament.service';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import {TeamService} from '../Services/team.service';

@Component({
    templateUrl: 'winner.component.html'
})
export class WinnerComponent implements OnInit {

  playoffId: any;
  tournamentId: any;
  tournamentName: any;
  tournyType: any;
  winner: any;
  players: any;
  teams: any;

  constructor(
    private _playerService: PlayerService, private _teamService: TeamService, private _tournyService: TournamentService,
    private http: HttpClient, private router: Router, private active_route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.winner = parseInt(this.active_route.snapshot.paramMap.get('winner_id'), 10);
    this.tournyType = this.active_route.snapshot.paramMap.get('type');
    this.tournamentId = this.active_route.snapshot.paramMap.get('tourny_id');
    this.tournamentName = this.active_route.snapshot.paramMap.get('tourny_name');
    this._playerService.getPlayers().subscribe((players) => {
      this.players = players;
      if (this.tournyType === 'doubles') {
        this._teamService.getTeams(this.tournamentId).subscribe((teams) => {
          this.teams = teams;
        });
      }
    });
  }

  convertToName(id) {
    if (id) {
      if (this.tournyType === 'singles') {
        return this.players.find((player) => player.id === id).name;
      } else {
        const foundTeam = this.teams.find((team) => team.id === id);
        return this.players.find((player) => player.id === foundTeam.player1Id).name
          + ', ' + this.players.find((player) => player.id === foundTeam.player2Id).name;
      }
    } else {
      return undefined;
    }
  }
}
