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

    patchDoublesPlayers() {
        let loser1, loser2;
        let winner1 = this.players.find((player) => player.id == this.currentGame.winner[0]);
        let winner2 = this.players.find((player) => player.id == this.currentGame.winner[1]);
        if (this.winningTeam === 'team1') {
            loser1 = this.players.find((player) => player.id == this.currentGame.team2[0]);
            loser2 = this.players.find((player) => player.id == this.currentGame.team2[1]);
        } else {
            loser1 = this.players.find((player) => player.id == this.currentGame.team1[0]);
            loser2 = this.players.find((player) => player.id == this.currentGame.team1[1]);
        }
        this.ps.updatePlayer(winner1.id, winner1.wins + 1, winner1.losses, winner1.totalDiff + this.scoreDifferential, winner1.gamesPlayed + 1);
        this.ps.updatePlayer(winner2.id, winner2.wins + 1, winner2.losses, winner2.totalDiff + this.scoreDifferential, winner2.gamesPlayed + 1);
        this.ps.updatePlayer(loser1.id, loser1.wins, loser1.losses, loser1.totalDiff - this.scoreDifferential, loser1.gamesPlayed + 1);
        this.ps.updatePlayer(loser2.id, loser2.wins, loser2.losses, loser2.totalDiff - this.scoreDifferential, loser2.gamesPlayed + 1);
    }

    patchSinglesPlayers() {
        let loser;
        let winner = this.players.find((player) => player.id == this.currentGame.winner);
        if (this.winningTeam === 'team1') {
            loser = this.players.find((player) => player.id == this.currentGame.team2);
        } else {
            loser = this.players.find((player) => player.id == this.currentGame.team1);
        }
        this.ps.updatePlayer(winner.id, winner.wins + 1, winner.losses, winner.totalDiff + this.scoreDifferential, winner.gamesPlayed + 1);
        this.ps.updatePlayer(loser.id, loser.wins, loser.losses, loser.totalDiff - this.scoreDifferential, loser.gamesPlayed + 1);
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
        if (this.tournyType === 'doubles') {
            this.patchDoublesPlayers();
        } else {
            this.patchSinglesPlayers();
        }
    }
}