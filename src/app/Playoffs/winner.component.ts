import { Component, OnInit } from "@angular/core";
import { PlayerService } from "../Services/player.service";
import { TournamentService } from "../Services/tournament.service";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { BracketService } from "../Services/bracket.service";

@Component({
    templateUrl: 'winner.component.html'
})
export class WinnerComponent implements OnInit{

    playoffId: any;
    tournament: any;
    winner: any;
    players: any;

    constructor(private _playerService: PlayerService, private _tournyService: TournamentService, private http: HttpClient, private router: Router, private active_route: ActivatedRoute) {
    }

    ngOnInit() {
        this._playerService.getPlayers().subscribe((players) => {
            this.players = players;
            this.playoffId = this.active_route.snapshot.paramMap.get('id');
            this.playoffId = parseInt(this.playoffId);
            this._tournyService.getTournament(this.playoffId).subscribe((tournament) => {
                this.tournament = tournament;
                this.winner = this.tournament.winner;
            });
        });
    }

    goHome() {
        this.router.navigateByUrl('');
    }
}