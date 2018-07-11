import { Component, OnInit } from "@angular/core";
import { AppComponent } from '../app.component';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { PlayerService } from "../Players/player.service";
import { TournamentService } from "../Tournaments/tournament.service";
import { ViewTournamentComponent } from "../Tournaments/view-tournament.component";

@Component({
    templateUrl: "add-game.component.html"
})

export class AddGameComponent implements OnInit{
    
    winningTeam: string;
    scoreDifferential: number;
    gameId: any; 
    currentGame: any;
    players = [];
    firstTeam: string;
    secondTeam: string;
    tournyName: string;
    tournyType: string;
    teamsBlank = false;
    scoreBlank = false;
    scoreInvalid = false;

    constructor (   
                public ps: PlayerService, 
                private ts: TournamentService, 
                private router: Router, 
                private http: HttpClient, 
                private active_route: ActivatedRoute
            ) { 
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

    ngOnInit () {
        this.ps.getPlayers().subscribe((players) => {
            this.players = players;
            this.gameId = this.active_route.snapshot.paramMap.get('id');
            this.tournyType = this.active_route.snapshot.paramMap.get('type');
                this.tournyName = this.active_route.snapshot.paramMap.get('name');
                this.http.get('http://localhost:3000/games?id=' + this.gameId).subscribe((game) => {
                    this.currentGame = game;
                    this.firstTeam = this.convertToName(this.currentGame[0].team1);
                    this.secondTeam = this.convertToName(this.currentGame[0].team2)
                });
        });
    }

    validateGame() {
        this.teamsBlank = this.winningTeam === undefined;
        this.scoreBlank = this.scoreDifferential === undefined;
        this.scoreInvalid = this.scoreDifferential < 1 || this.scoreDifferential > 8;
        if (!this.teamsBlank && !this.scoreBlank && !this.scoreInvalid) {
            this.submitGame();
        }
    }

    // user submits form for game result
    submitGame() {
        if (this.winningTeam === 'team1') {
            this.ts.updateGame(this.gameId, this.currentGame[0].team1, this.scoreDifferential).subscribe(() => {
                this.router.navigateByUrl('/tournaments/' + this.tournyType + '/' + this.tournyName);
            });
        } else {
            this.ts.updateGame(this.gameId, this.currentGame[0].team2, this.scoreDifferential).subscribe(() => {
                this.router.navigateByUrl('/tournaments/' + this.tournyType + '/' + this.tournyName);
            });
        }
    }
}