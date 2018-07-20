import { Component, OnInit } from "@angular/core";
import { PlayerService } from "../Players/player.service";
import { TournamentService } from "../Tournaments/tournament.service";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { BracketService } from "../Brackets/bracket.service";

@Component({
    templateUrl: 'winner.component.html'
})
export class WinnerComponent implements OnInit{

    playoffId: any;
    tournament: any;
    winner: any;
    players: any;

    constructor(private ps: PlayerService, public bs: BracketService, private ts: TournamentService, private http: HttpClient, private router: Router, private active_route: ActivatedRoute) {
    }

    ngOnInit() {
        this.ps.getPlayers().subscribe((players) => {
            this.players = players;
            this.playoffId = this.active_route.snapshot.paramMap.get('id');
            this.playoffId = parseInt(this.playoffId);
            this.ts.getTournament(this.playoffId).subscribe((tournament) => {
                this.tournament = tournament;
                this.winner = this.tournament.winner;
            });
        });
    }

    goHome() {
        this.router.navigateByUrl('');
    }
}