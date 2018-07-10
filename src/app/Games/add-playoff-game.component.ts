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
                        if (JSON.stringify(round[i]) !== '{}' && !this.playoffPool.includes(round[i].team)) {
                            this.playoffPool.push(round[i].team);
                        }
                    }
                }
                console.log(this.playoffPool);
            });
        });
    }

    convertToName(team) {
        let teamString = JSON.stringify(team);
        if (team instanceof Array) {
            let firstName = this.players.find((player) => player.id === team[0]).name;
            let secondName = this.players.find((player) => player.id === team[1]).name;
            return firstName + ' & ' + secondName
        }
        return this.players.find((player) => player.id === team).name
    }

    onSubmit() {
        console.log(this.playoffPool);
        console.log(this.winningPlayer);
        console.log(this.losingPlayer);
        let team1 = this.playoffPool.find((team) => this.convertToName(team) == this.winningPlayer);
        let team2 = this.playoffPool.find((team) => this.convertToName(team) == this.losingPlayer);
        let playoffGame = new Game(undefined, true, this.playoffId, undefined, team1, team2, team1, this.scoreDifferential)
        this.ts.addGame(playoffGame).subscribe(() => {
            this.router.navigateByUrl('/playoffs/' + this.playoffId);
        });
    }
}