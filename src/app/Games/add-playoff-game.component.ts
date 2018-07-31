import { Component, OnInit } from "@angular/core";
import { AppComponent } from '../app.component';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { PlayerService } from "../Services/player.service";
import { TournamentService } from "../Services/tournament.service";
import { ViewTournamentComponent } from "../Tournaments/view-tournament.component";
import { Game } from "./game";
import { EloService } from "../Services/elo.service";
import { Player } from "../Players/player";
import { GameService } from "../Services/game.service";

@Component({
    templateUrl: "add-playoff-game.component.html"
})

export class AddPlayoffGameComponent implements OnInit{
    
    players: Player[];
    playoff: Object;
    playoffId: any;
    bracket = [];
    playoffPool = [];
    winningPlayer: Object;
    losingPlayer: Object;
    scoreDifferential: number;

    // booleans for validating form fields
    teamsBlank = false;
    scoreBlank = false;
    scoreInvalid = false;
    
    constructor (   
                public _playerService: PlayerService, 
                private _tournyService: TournamentService, 
                private router: Router, 
                private http: HttpClient, 
                private active_route: ActivatedRoute,
                private elo_adjuster: EloService,
                private _gameService: GameService
            ) { 
    }

    ngOnInit() {
        this._playerService.getPlayers().subscribe((players) => {
            this.players = players;
            this.playoffId = this.active_route.snapshot.paramMap.get('id');
            this._tournyService.getPlayoff(this.playoffId).subscribe((playoff) => {
                this.playoff = playoff;
                this.bracket = playoff['bracket'];
                // extract players from the bracket
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

    // Validates form fields
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

    // Updates player database with results from entered doubles game
    patchDoublesPlayers(game) {
        let winner1 = this.players.find((player) => player.id == game.winner[0]);
        let winner2 = this.players.find((player) => player.id == game.winner[1]);
        let loser1 = this.players.find((player) => player.id == game.team2[0]);
        let loser2 = this.players.find((player) => player.id == game.team2[1]);
     
        let newElos = this._playerService.getNewDoublesElos(winner1, winner2, loser1, loser2);

        this._playerService.updatePlayer(winner1.id, winner1.elo, newElos[0], winner1.wins + 1, winner1.losses, winner1.totalDiff + game.differential, winner1.singlesPlayed, winner1.doublesPlayed + 1).subscribe();
        this._playerService.updatePlayer(winner2.id, winner2.elo, newElos[1], winner2.wins + 1, winner2.losses, winner2.totalDiff + game.differential, winner2.singlesPlayed, winner2.doublesPlayed + 1).subscribe();
        this._playerService.updatePlayer(loser1.id, loser1.elo, newElos[2], loser1.wins, loser1.losses + 1, loser1.totalDiff - game.differential, loser1.singlesPlayed, loser1.doublesPlayed + 1).subscribe();
        this._playerService.updatePlayer(loser2.id, loser2.elo, newElos[3], loser2.wins, loser2.losses + 1, loser2.totalDiff - game.differential, loser2.singlesPlayed, loser2.doublesPlayed + 1).subscribe();
    }

    // Updates player database with results from entered singles game
    patchSinglesPlayers(game) {
        let winner = this.players.find((player) => player.id == game.winner);
        let loser = this.players.find((player) => player.id == game.team2);

        // Determines the severity of elo fluctuation based on the games played by each player
        let winningKFactor = this._playerService.getKFactor(winner, true);
        let losingKFactor = this._playerService.getKFactor(loser, true);

        let newWinnerElo = this.elo_adjuster.calculateNewElo(winner.elo, 1, this.elo_adjuster.calculateExpScore(winner.elo, loser.elo), winningKFactor);
        let newLoserElo = this.elo_adjuster.calculateNewElo(loser.elo, 0, this.elo_adjuster.calculateExpScore(loser.elo, winner.elo), losingKFactor);  

        this._playerService.updatePlayer(winner.id, newWinnerElo, winner.doublesElo, winner.wins + 1, winner.losses, winner.totalDiff + game.differential, winner.singlesPlayed + 1, winner.doublesPlayed).subscribe();
        this._playerService.updatePlayer(loser.id, newLoserElo, loser.doublesElo, loser.wins, loser.losses + 1, loser.totalDiff - game.differential, loser.singlesPlayed + 1, loser.doublesPlayed).subscribe();
    }

    // Submits game form, patches database, adds game to the database
    submitGame() {
        let team1 = this.playoffPool.find((team) => this.convertToName(team) == this.winningPlayer);
        let team2 = this.playoffPool.find((team) => this.convertToName(team) == this.losingPlayer);
        let playoffGame = new Game(undefined, true, this.playoffId, undefined, team1, team2, team1, this.scoreDifferential);
        if (team1 instanceof Array) {
            this.patchDoublesPlayers(playoffGame);
        } else {
            this.patchSinglesPlayers(playoffGame);
        }
        this._gameService.addGame(playoffGame).subscribe(() => {
            this.router.navigateByUrl('/playoffs/' + this.playoffId);
        });
    }
}