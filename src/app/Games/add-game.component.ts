import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PlayerService } from '../Services/player.service';
import { EloService } from '../Services/elo.service';
import { GameService } from '../Services/game.service';
import { environment } from 'environments/environment';

@Component({
    templateUrl: 'add-game.component.html'
})

export class AddGameComponent implements OnInit {

    winningTeam: string;
    validator: string;
    scoreDifferential: number;
    gameId: string;
    currentGame: Object;
    players = [];
    firstTeam: string;
    secondTeam: string;
    tournyName: string;
    tournyType: string;

    // variables for validating game data input
    teamsBlank = false;
    scoreBlank = false;
    scoreInvalid = false;
    validatorBlank = false;

    constructor (
                public _playerService: PlayerService,
                private router: Router,
                private http: HttpClient,
                private active_route: ActivatedRoute,
                private elo_adjuster: EloService,
                private _gameService: GameService
            ) {
    }

    ngOnInit () {
        this._playerService.getPlayers().subscribe((players) => {
            this.players = players;
            this.gameId = this.active_route.snapshot.paramMap.get('id');
            this.tournyType = this.active_route.snapshot.paramMap.get('type');
            this.tournyName = this.active_route.snapshot.paramMap.get('name');
        });
    }

    convertToName(team) {
        if (team instanceof Array) {
            const firstName = this.players.find((player) => player.id === team[0]).name;
            const secondName = this.players.find((player) => player.id === team[1]).name;
            return firstName + ' & ' + secondName;
        }
        return this.players.find((player) => player.id === team).name;
    }

    // Updates the player database with data from the entered game
    patchDoublesPlayers() {
        let loser1, loser2;
        const winner1 = this.players.find((player) => player.id === this.currentGame[0].winner[0]);
        const winner2 = this.players.find((player) => player.id === this.currentGame[0].winner[1]);
        if (this.winningTeam === 'team1') {
            loser1 = this.players.find((player) => player.id === this.currentGame[0].team2[0]);
            loser2 = this.players.find((player) => player.id === this.currentGame[0].team2[1]);
        } else {
            loser1 = this.players.find((player) => player.id === this.currentGame[0].team1[0]);
            loser2 = this.players.find((player) => player.id === this.currentGame[0].team1[1]);
        }
        const newElos = this.elo_adjuster.getNewDoublesElos(winner1, winner2, loser1, loser2);
        this._playerService.updatePlayer(
          winner1.id, winner1.elo, newElos[0], winner1.wins + 1, winner1.losses,
          winner1.totalDiff + this.currentGame[0].differential, winner1.singlesPlayed,
          winner1.doublesPlayed + 1)
          .subscribe();

        this._playerService.updatePlayer(
          winner2.id, winner2.elo, newElos[1], winner2.wins + 1, winner2.losses,
          winner2.totalDiff + this.currentGame[0].differential, winner2.singlesPlayed,
          winner2.doublesPlayed + 1)
          .subscribe();

        this._playerService.updatePlayer(
          loser1.id, loser1.elo, newElos[2], loser1.wins, loser1.losses + 1,
          loser1.totalDiff - this.currentGame[0].differential, loser1.singlesPlayed,
          loser1.doublesPlayed + 1)
          .subscribe();

        this._playerService.updatePlayer(
          loser2.id, loser2.elo, newElos[3], loser2.wins, loser2.losses + 1,
          loser2.totalDiff - this.currentGame[0].differential, loser2.singlesPlayed,
          loser2.doublesPlayed + 1)
          .subscribe();

        this.router.navigateByUrl('/tournaments/' + this.tournyType + '/' + this.tournyName);
    }

    // Updates the player database with data from the entered game
    patchSinglesPlayers() {
        let loser;
        const winner = this.players.find((player) => player.id === this.currentGame[0].winner);
        if (this.winningTeam === 'team1') {
            loser = this.players.find((player) => player.id === this.currentGame[0].team2);
        } else {
            loser = this.players.find((player) => player.id === this.currentGame[0].team1);
        }
        const winningKFactor = this.elo_adjuster.getKFactor(winner, true);
        const losingKFactor = this.elo_adjuster.getKFactor(loser, true);
        const newWinnerElo = this.elo_adjuster.calculateNewElo(winner.elo, 1, this.elo_adjuster.calculateExpScore(winner.elo, loser.elo), winningKFactor);
        const newLoserElo = this.elo_adjuster.calculateNewElo(loser.elo, 0, this.elo_adjuster.calculateExpScore(loser.elo, winner.elo), losingKFactor);
        this._playerService.updatePlayer(winner.id, newWinnerElo, winner.doublesElo, winner.wins + 1, winner.losses, winner.totalDiff + this.currentGame[0].differential, winner.singlesPlayed + 1, winner.doublesPlayed).subscribe();
        this._playerService.updatePlayer(loser.id, newLoserElo, loser.doublesElo, loser.wins, loser.losses + 1, loser.totalDiff - this.currentGame[0].differential, loser.singlesPlayed + 1, loser.doublesPlayed).subscribe();
        this.router.navigateByUrl('/tournaments/' + this.tournyType + '/' + this.tournyName);
    }

}
