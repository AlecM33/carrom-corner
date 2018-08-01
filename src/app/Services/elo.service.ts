import { Injectable, Optional, OnInit } from "@angular/core";
import { Player } from "../Players/player";
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { PlayerListComponent } from "../Players/player-list.component";
import { IfObservable } from "rxjs/observable/IfObservable";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';

/* Service for adjusting player Elos */
@Injectable()
export class EloService {

    public players: Player[];

    constructor(private http: HttpClient) {
    }

    transformRatings(rating) {
        console.log(Math.pow(10, rating / 400));
        return Math.pow(10, rating / 400);
    }

    calculateExpScore(rating1, rating2) {
        return this.transformRatings(rating1) / ((this.transformRatings(rating1) + this.transformRatings(rating2)));
    }

    calculateNewElo(rating, actualScore, expScore, kFactor) {
        return rating + (kFactor * (actualScore - expScore));
    }

    getKFactor(player, singles): Number {
        let gamesPlayed;
        if (singles) {
            if (player.singlesPlayed <= 10) {
                return 128;
            }
            else if (player.singlesPlayed > 10 && player.singlesPlayed < 30) {
                return 32;
            } else {
                return 24;
            }
        } else {
            if (player.doublesPlayed <= 10) {
                return 128;
            }
            else if (player.doublesPlayed > 10 && player.doublesPlayed < 30) {
                return 32;
            } else {
                return 24;
            }
        }
    }

    getNewDoublesElos(winner1, winner2, loser1, loser2): Array<number> {
        let elos = [];
        let winningKFactor1 = this.getKFactor(winner1, false);
        let winningKFactor2 = this.getKFactor(winner2, false);
        let losingKFactor1 = this.getKFactor(loser1, false);
        let losingKFactor2 = this.getKFactor(loser2, false);
        
        let winningTeamElo = Math.ceil(winner1.elo + winner2.elo) / 2;
        let losingTeamElo = Math.ceil(loser1.elo + loser2.elo) / 2;

        elos.push(this.calculateNewElo(winner1.doublesElo, 1, this.calculateExpScore(winningTeamElo, losingTeamElo), winningKFactor1));
        elos.push(this.calculateNewElo(winner2.doublesElo, 1, this.calculateExpScore(winningTeamElo, losingTeamElo), winningKFactor2));
        elos.push(this.calculateNewElo(loser1.doublesElo, 0, this.calculateExpScore(losingTeamElo, winningTeamElo), losingKFactor1));
        elos.push(this.calculateNewElo(loser2.doublesElo, 0, this.calculateExpScore(losingTeamElo, winningTeamElo), losingKFactor2));

        return elos;
    }
}