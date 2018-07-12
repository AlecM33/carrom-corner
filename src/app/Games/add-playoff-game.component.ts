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

    ngOnInit() {
        this.ps.getPlayers().subscribe((players) => {
            this.players = players;
            this.playoffId = this.active_route.snapshot.paramMap.get('id');
            this.ts.getPlayoff(this.playoffId).subscribe((playoff) => {
                this.playoff = playoff;
                this.bracket = playoff['bracket'];
                this.playoffPool = [];
                for (let round of this.bracket) {
                    for (let i = 0; i < round.length; i++) {
                        if (JSON.stringify(round[i]) !== '{}' && !this.playoffPool.includes(round[i].team)) {
                            this.playoffPool.push(round[i].team);
                        }
                    }
                }
            });
        });
    }

    validateGame() {
        this.teamsBlank = this.winningPlayer === undefined || this.losingPlayer === undefined;
        this.scoreBlank = this.scoreDifferential === undefined;
        this.scoreInvalid = this.scoreDifferential < 1 || this.scoreDifferential > 8;
        if (!this.teamsBlank && !this.scoreBlank && !this.scoreInvalid) {
            this.submitGame();
        }
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

    patchDoublesPlayers(game) {
        let winner1 = this.players.find((player) => player.id == game.winner[0]);
        let winner2 = this.players.find((player) => player.id == game.winner[1]);
        let loser1 = this.players.find((player) => player.id == game.team2[0]);
        let loser2 = this.players.find((player) => player.id == game.team2[1]);
     
        
        this.ps.updatePlayer(winner1.id, winner1.wins + 1, winner1.losses, winner1.totalDiff + game.differential, winner1.gamesPlayed + 1).subscribe();
        this.ps.updatePlayer(winner2.id, winner2.wins + 1, winner2.losses, winner2.totalDiff + game.differential, winner2.gamesPlayed + 1).subscribe();
        this.ps.updatePlayer(loser1.id, loser1.wins, loser1.losses + 1, loser1.totalDiff - game.differential, loser1.gamesPlayed + 1).subscribe();
        this.ps.updatePlayer(loser2.id, loser2.wins, loser2.losses + 1, loser2.totalDiff - game.differential, loser2.gamesPlayed + 1).subscribe();
    }

    patchSinglesPlayers(game) {
        let winner = this.players.find((player) => player.id == game.winner);
        let loser = this.players.find((player) => player.id == game.team2);
        this.ps.updatePlayer(winner.id, winner.wins + 1, winner.losses, winner.totalDiff + game.differential, winner.gamesPlayed + 1).subscribe();
        this.ps.updatePlayer(loser.id, loser.wins, loser.losses + 1, loser.totalDiff - game.differential, loser.gamesPlayed + 1).subscribe();
    }


    submitGame() {
        let team1 = this.playoffPool.find((team) => this.convertToName(team) == this.winningPlayer);
        let team2 = this.playoffPool.find((team) => this.convertToName(team) == this.losingPlayer);
        let playoffGame = new Game(undefined, true, this.playoffId, undefined, team1, team2, team1, this.scoreDifferential);
        if (team1 instanceof Array) {
            this.patchDoublesPlayers(playoffGame);
        } else {
            this.patchSinglesPlayers(playoffGame);
        }
        this.ts.addGame(playoffGame).subscribe(() => {
            this.router.navigateByUrl('/playoffs/' + this.playoffId);
        });
    }
}