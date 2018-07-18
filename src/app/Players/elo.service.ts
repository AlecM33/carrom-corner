import { Injectable, Optional, OnInit } from "@angular/core";
import { Player } from "./player";
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { PlayerListComponent } from "./player-list.component";
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
        return Math.pow(10, (Math.ceil(rating / 400)));
    }

    calculateExpScore(rating1, rating2) {
        return this.transformRatings(rating1) / (this.transformRatings(rating1) + this.transformRatings(rating2))
    }

    calculateNewElo(rating, actualScore, expScore, kFactor) {
        return rating + (kFactor * (actualScore - expScore));
    }
}