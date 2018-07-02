import { Injectable, Optional, OnInit } from "@angular/core";
import { Player } from "./player";
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { PlayerListComponent } from "./player-list.component";
import { IfObservable } from "rxjs/observable/IfObservable";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';

/* This service provides useful methods in regards to manipulating player data and 
making calls to the database */
@Injectable()
export class PlayerService {


    public players: Player[];

    constructor(private http: HttpClient) {
    }


    adjustPlayerElo(winningPlayer: Player, losingPlayer: Player) {
    }

    adjustPlayerRecord(gameResult: number) {

    }

    adjustTournamentWins(winningPlayer: Player) {
        
    }

    // Takes an observable and creates player objects from the data observed
    populateWithPlayers(ob: any[]): Player[] {
        let players = [];

        for (let piece of ob) {
            players.push(new Player(
                                    piece['id'], 
                                    piece['name'], 
                                    piece['nickname'], 
                                    piece['elo'], 
                                    piece['wins'], 
                                    piece['losses'], 
                                    piece['winPtg'])
                                );
        }
        return players;
    }

    // Sends a GET request to the database for all players
    getPlayers(): Observable<Player[]>{
        if(this.players !== undefined && this.players.length > 0){
            return Observable.of(this.players);
        } else {
            return this.http.get('http://localhost:3000/players').map(this.populateWithPlayers);
        }
    }
    
    // Sends a POST request to add a player to the database
    addPlayer(newPlayer) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        let payload = { "name": newPlayer.name,
                        "elo": 1200,
                        "nickname": newPlayer.nickname,
                        "wins": 0,
                        "losses": 0,
                        "winPtg": 0.0
                      };
        return this.http.post('http://localhost:3000/players', payload, httpOptions);
    }

    // Sends a DELETE request to remove the specified player
    deletePlayer(player) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        return this.http.delete('http://localhost:3000/players/' + player['id'], httpOptions);
    }
}
