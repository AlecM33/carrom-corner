import { Component, OnInit } from "@angular/core";
import { AppComponent } from '../app.component';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { PlayerService } from "../Players/player.service";
import { TournamentService } from "../Tournaments/tournament.service";
import { ViewTournamentComponent } from "../Tournaments/view-tournament.component";
import { Game } from "./game";

@Component({
    templateUrl: "add-playoff-game.component.html"
})

export class AddPlayoffGameComponent implements OnInit{
    
    players: any;
    playoff: any;
    playoffId: any;
    bracket: any;
    playoffPool: any;
    winningPlayer: any;
    losingPlayer: any;
    scoreDifferential: any;
    
    constructor (   
                public ps: PlayerService, 
                private ts: TournamentService, 
                private router: Router, 
                private http: HttpClient, 
                private active_route: ActivatedRoute
            ) { 
    }

    ngOnInit() {
        this.ps.getPlayers().subscribe((players) => {
            this.players = players;
            this.playoffId = this.active_route.snapshot.paramMap.get('id');
            this.ts.getPlayoff(this.playoffId).subscribe((playoff) => {
                this.playoff = playoff;
                this.bracket = playoff['bracket'];
                console.log(this.bracket);
                this.playoffPool = [];
                for (let round of this.bracket) {
                    for (let i = 0; i < round.length; i++) {
                        if (JSON.stringify(round[i]) !== '{}' && !this.playoffPool.includes(this.convertToName(round[i].playerId))) {
                            this.playoffPool = this.playoffPool.concat(this.convertToName(round[i].playerId));
                        }
                    }
                }
                console.log(this.playoffPool);
            });
        });
    }

    convertToName(id) {
        return this.players.find((player) => player.id == id).name
    }

    onSubmit() {
        let id1 = this.players.find((player) => player.name === this.winningPlayer).id;
        let id2 = this.players.find((player) => player.name === this.losingPlayer).id;
        let playoffGame = new Game(undefined, true, this.playoffId, undefined, id1, id2, id1, this.scoreDifferential)
        this.ts.addGame(playoffGame).subscribe(() => {
            this.router.navigateByUrl('/playoffs/' + this.playoffId);
        });
        console.log(this.winningPlayer);
        console.log(this.losingPlayer);
        console.log(this.scoreDifferential);
    }
}