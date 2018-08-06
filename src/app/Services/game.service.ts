import { Injectable, OnInit } from "@angular/core";
import { Player } from "../Players/player";
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { PlayerListComponent } from "../Players/player-list.component";
import { Observable } from "rxjs/Observable";
import { Tournament } from "../Tournaments/tournament";
import { Pool } from "../Pools/pool";
import { Game } from "../Games/game";
import { Playoff } from "../Playoffs/playoff";
import { environment } from "environments/environment";

@Injectable()
export class GameService {

    constructor(private http: HttpClient) {}

    populateWithGames(ob: any[]): Game[] {
        let games = [];

        for (let piece of ob) {
            games.push(
                new Game(
                        piece['id'], 
                        piece['playoff'],
                        piece['tournamentId'], 
                        piece['scheduleIndex'],
                        piece['team1'], 
                        piece['team2'], 
                        piece['winner'], 
                        piece['differential']
                    ));
        }
        return games;
    }

    getGames(id): Observable<Game[]> {
        return this.http.get(environment.api_url + '/games?tournamentId=' + id + '&playoff=false').map(this.populateWithGames);
    }

    getPlayoffGames(id): Observable<Game[]> {
        return this.http.get(environment.api_url + '/games?tournamentId=' + id + '&playoff=true').map(this.populateWithGames);
    }
    
    addPool(newPool: Pool) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        let payload = { 
                        "tournamentId": newPool.tournamentId,
                        "pools": newPool.pools,
                        "tournyName": newPool.tournyName
                      }; 
        return this.http.post(environment.api_url + '/pools', payload, httpOptions);
    }

    addGame(newGame: Game) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        let payload = { 
                        "playoff": newGame.playoff,
                        "tournamentId": newGame.tournamentId,
                        "scheduleIndex": newGame.scheduleIndex,
                        "team1": newGame.team1,
                        "team2": newGame.team2,
                        "winner": newGame.winner,
                        "differential": newGame.differential
                      }; 
        return this.http.post(environment.api_url + '/games', payload, httpOptions);
    }

    updateGame(id, winner, differential): Observable<any> {
        return this.http.patch(environment.api_url + '/games/' + id,
        {
            "winner": winner,
            "differential": differential
        });
    }
}
