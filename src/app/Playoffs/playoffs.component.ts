import { Component, OnInit, ViewChild } from "@angular/core";
import { PlayerService } from "../Services/player.service";
import { TournamentService } from "../Services/tournament.service";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { BracketService } from "../Services/bracket.service";
import { Player } from "../Players/player";
import { Game } from "../Games/game";
import { GameService } from "../Services/game.service";
import {NgbModule, NgbTooltipConfig, NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import * as _swal from 'sweetalert';
import { SweetAlert } from 'sweetalert/typings/core';
import { environment } from "environments/environment";
import { EloService } from "../Services/elo.service";
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
const swal: SweetAlert = _swal as any;

@Component({
    templateUrl: 'playoffs.component.html',
})
export class PlayoffsComponent implements OnInit{

    constructor(public _playerService: PlayerService, 
                public _tournyService: TournamentService, 
                public http: HttpClient, public router: Router, 
                public active_route: ActivatedRoute,
                public _gameService: GameService, 
                public tooltipConfig: NgbTooltipConfig,
                public elo_adjuster: EloService) {
    }

    public players: Player[];
    public playoffId: string;
    public winner: Player;
    public playoff: Object;
    public bracketSize = 0;
    public numberOfRounds = 0;
    public bracket = [];
    public tournyType = 'singles'
    public playInRound = [];
    public playoffGames: Game[];
    public newPlayoffGames = [];
    public tournamentWinner: any;
    public scoreDifferential: number;
    public round: number;
    public isOver = true;

    // variables related to modal for playoff game result entry
    public modalOpen = false;
    public validator: any;
    public modalWinner: any;
    public modalLoser: any;
    validatorBlank = false;
    scoreBlank = false;
    scoreInvalid = false;

    ngOnInit() {
        this._playerService.getPlayers().subscribe((players) => {
            this.players = players;
            this.playoffId = this.active_route.snapshot.paramMap.get('id');
            this.constructPlayoff();
        });
        
    }

    constructPlayoff() {
        this._tournyService.getPlayoff(this.playoffId).subscribe((playoff) => {
            this.tournamentWinner = playoff['winner'];
            this.isOver = playoff['ended'];
            this.playoff = playoff;
            this.bracket = playoff['bracket'];
            this.playInRound = this.bracket.shift();
            if (this.bracket[0][0].team instanceof Array) {
                this.tournyType = 'doubles';
            }
            this.getPlayoffGames();
        });
    }

    getPlayoffGames() {
        this._gameService.getPlayoffGames(this.playoffId).subscribe((games) => {
            this.playoffGames = games;
        });
    }


    goBack() {
        this.router.navigateByUrl('/tournaments');
    }

    endTournament() {
        this.playoff['ended'] = true;
        if (this.newPlayoffGames.length > 0) {
            this.saveBracket();
        }
        this._tournyService.endTournament(this.playoffId, this.tournamentWinner, this.convertToName(this.tournamentWinner)).subscribe(() => this.router.navigateByUrl('/playoffs/' + this.playoffId + '/winner'));
    }

    viewGroupStage() {
        let name;
        this._tournyService.getTournament(this.playoff['tournamentId']).subscribe((tourny) => {
            name = tourny['name'];
            this.router.navigateByUrl('/tournaments/' + this.tournyType + '/' + name);
        });
    }

    // Updates player database with results from entered doubles game
    patchDoublesPlayers(game) {
        let winner1 = this.players.find((player) => player.id == game.winner[0]);
        let winner2 = this.players.find((player) => player.id == game.winner[1]);
        let loser1 = this.players.find((player) => player.id == game.team2[0]);
        let loser2 = this.players.find((player) => player.id == game.team2[1]);
     
        let newElos = this.elo_adjuster.getNewDoublesElos(winner1, winner2, loser1, loser2);

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
        let winningKFactor = this.elo_adjuster.getKFactor(winner, true);
        let losingKFactor = this.elo_adjuster.getKFactor(loser, true);

        let newWinnerElo = this.elo_adjuster.calculateNewElo(winner.elo, 1, this.elo_adjuster.calculateExpScore(winner.elo, loser.elo), winningKFactor);
        let newLoserElo = this.elo_adjuster.calculateNewElo(loser.elo, 0, this.elo_adjuster.calculateExpScore(loser.elo, winner.elo), losingKFactor);  

        this._playerService.updatePlayer(winner.id, newWinnerElo, winner.doublesElo, winner.wins + 1, winner.losses, winner.totalDiff + game.differential, winner.singlesPlayed + 1, winner.doublesPlayed).subscribe();
        this._playerService.updatePlayer(loser.id, newLoserElo, loser.doublesElo, loser.wins, loser.losses + 1, loser.totalDiff - game.differential, loser.singlesPlayed + 1, loser.doublesPlayed).subscribe();
    }

    // Function for validating form
    validateGame() {
        this.validatorBlank = this.validator === undefined;
        this.scoreBlank = this.scoreDifferential === undefined;
        this.scoreInvalid = this.scoreDifferential < 1 || this.scoreDifferential > 8;
        if (!this.validatorBlank && !this.scoreBlank && !this.scoreInvalid) {
            this.advancePlayer();
        }
    }

    // Submits game form, patches database, adds game to the database
    submitGame() {
        let validatingPlayer;
        if (this.validator === 'team1') {
            validatingPlayer = this.modalWinner.team;
        } else {
            validatingPlayer = this.modalLoser.team;
        }
        let playoffGame = new Game(undefined, true, parseInt(this.playoffId), undefined, this.modalWinner.team, this.modalLoser.team, this.modalWinner.team, this.scoreDifferential, validatingPlayer);
        console.log(playoffGame);
        this.newPlayoffGames.push(playoffGame);
        this.closeModal();
    }
    
    resetBracket() {
        swal({
            title: "Revert Changes",
            text: "Are you sure you wish to clear your changes? This will also delete any games you entered since your last save.",
            buttons: [true, true],
        }).then((wantsToSave) => {
            if (wantsToSave) {
                this._tournyService.getPlayoff(this.playoffId).subscribe((playoff) => {
                    this.playoff = playoff;
                    this.bracket = playoff['bracket'];
                    this.playInRound = this.bracket.shift();
                    this.tournamentWinner = playoff['winner'];
                    this.newPlayoffGames = [];
                    this.getPlayoffGames();
                });
            }
        });
    }

    saveBracket() {
        swal({
            title: "Save Bracket",
            text: "Save the bracket in its current state?",
            buttons: [true, true],
        }).then((wantsToSave) => {
            if (wantsToSave) {
                if (this.tournamentWinner) {
                    this.playoff['winner'] = this.tournamentWinner;
                }
                for (let game of this.newPlayoffGames) {
                    if (game.winner instanceof Array) {
                        this.patchDoublesPlayers(game);
                    } else {
                        this.patchSinglesPlayers(game);
                    }
                    this._gameService.addGame(game).subscribe(() => {
                        this.getPlayoffGames();
                        this.newPlayoffGames = [];
                    });
                }
                this._tournyService.updatePlayoff(this.playoff, this.bracket, this.playInRound).subscribe(() => {
                    let notice = document.getElementById('notice');
                    notice.textContent = "Bracket Successfully Saved \u2713"
                });
            }
        });
    }

    closeModal() {
        this.modalOpen = false;
        this.validatorBlank = false;
        this.scoreBlank = false;
        this.scoreInvalid = false;
        this.scoreDifferential = undefined;
    }

    advancePlayer = () => {
        this.submitGame();
        if (this.round === -1) {
            console.log(this.bracket);
            console.log(this.playInRound);
            console.log(this.modalWinner);
            let openSpotNumber = Math.ceil((this.playInRound.indexOf(this.modalWinner) + 1) / 2);
            let openSpotCount = 0;
            let i = 0;
            while (openSpotCount < openSpotNumber) {
                if (this.playoff['playInSpots'].includes(i)) {
                    openSpotCount ++;
                }
                i ++;
            }
            console.log(i);
            this.bracket[0][i - 1] = this.modalWinner;
        } else if (this.bracket[this.round].length === 2) {
            this.tournamentWinner = this.modalWinner.team;
        } else {
            let openSpot = Math.floor(this.bracket[this.round].indexOf(this.modalWinner) / 2);
            this.bracket[this.round + 1][openSpot] = this.modalWinner;
        }
    }

    openModal(winner, loser, round) {
        this.modalLoser = loser;
        this.modalWinner = winner;
        this.round = round;
        this.modalOpen = true;
    }

    isEmpty(obj) {
        return JSON.stringify(obj) === '{}';
    }

    returnPower(i): number {
        return Math.pow(2, i);
    }

    indexArray(n: number): any[] {
        return Array(n);
    }

    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; 
    }

    isPowerOfTwo(x) {
        return (Math.log(x)/Math.log(2)) % 1 === 0;
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
}