import { Injectable, OnInit } from "@angular/core";
import { Player } from "../Players/player";
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { PlayerListComponent } from "../Players/player-list.component";
import { Observable } from "rxjs/Observable";
import { Tournament } from "./tournament";
import { Pool } from "../Pools/pool";
import { Game } from "../Games/game";
import { Playoff } from "../Playoffs/playoff";

@Injectable()
export class TournamentService {
    constructor(private http: HttpClient) {
    }

    tournaments: Tournament[];
    games: Game[];

    populateWithTournaments(ob: any[]): Tournament[] {
        let tournaments = [];
        for (let piece of ob) {
            tournaments.push(
                new Tournament(
                                piece['id'], 
                                piece['playoffDefined'],
                                piece['winner'], 
                                piece['name'], 
                                piece['singles'], 
                                piece['size'], 
                                piece['players'], 
                                piece['teams'], 
                                piece['games'], 
                                piece['standings']
                            ));
        }
        return tournaments;
    }

    endTournament (id, winnerId) {
        this.declarePlayoffWinner(id, winnerId).subscribe();
        return this.http.patch('http://localhost:3000/tournaments/' + id,
        {
            "winner": winnerId
        });
    }

    declarePlayoffWinner(id, winnerId) {
        return this.http.patch('http://localhost:3000/playoffs/' + id,
        {
            "winner": winnerId
        });
    }

    populateWithGames(ob: any[]): Game[] {
        let games = [];

        for (let piece of ob) {
            games.push(
                new Game(
                        piece['id'], 
                        piece['playoff'],
                        piece['tournamentId'], 
                        piece['scheduleIndex'],
                        piece['id1'], 
                        piece['id2'], 
                        piece['winner'], 
                        piece['differential']
                    ));
        }
        return games;
    }

    getGames(id): Observable<Game[]> {
        return this.http.get('http://localhost:3000/games?tournamentId=' + id + '&playoff=false').map(this.populateWithGames);
    }

    getPlayoffGames(id): Observable<Game[]> {
        return this.http.get('http://localhost:3000/games?tournamentId=' + id + '&playoff=true').map(this.populateWithGames);
    }

    getTournaments(): Observable<Tournament[]>{
        if (this.tournaments !== undefined && this.tournaments.length > 0) {
            return Observable.of(this.tournaments);
        } else {
           return this.http.get('http://localhost:3000/tournaments').map(this.populateWithTournaments);
        }
    }

    getTournament(name): Observable<Object>{
        if (typeof(name) === 'number') {
            return this.http.get('http://localhost:3000/tournaments?id=' + name);
        }
        console.log('got here');
        return this.http.get('http://localhost:3000/tournaments?name=' + name);
    }

    getPlayoff(id): Observable<Object>{
        return this.http.get('http://localhost:3000/playoffs/' + id);
    }

    
    addTournament(newTournament: Tournament) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        let payload = { "name": newTournament.name,
                        "playoffDefined": newTournament.playoffDefined,
                        "singles": newTournament.singles,
                        "size": newTournament.size,
                        "players": newTournament.players,
                        "teams": newTournament.teams,
                        "games": newTournament.games,
                        "standings": newTournament.pools
                      }; 
        return this.http.post('http://localhost:3000/tournaments', payload, httpOptions);
    }

    addPool(newPool: Pool) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        let payload = { 
                        "pools": newPool.pools,
                        "tournyName": newPool.tournyName
                      }; 
        return this.http.post('http://localhost:3000/pools', payload, httpOptions);
    }

    addGame(newGame: Game) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        let payload = { 
                        "playoff": newGame.playoff,
                        "tournamentId": newGame.tournamentId,
                        "scheduleIndex": newGame.scheduleIndex,
                        "id1": newGame.id1,
                        "id2": newGame.id2,
                        "winner": newGame.winner,
                        "differential": newGame.differential
                      }; 
        return this.http.post('http://localhost:3000/games', payload, httpOptions);
    }

    addPlayoff(newPlayoff: Playoff) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        let payload = {
                        "tournamentId": newPlayoff.tournamentId,
                        "playInSpots": newPlayoff.playInSpots,
                        "bracket": newPlayoff.bracket,
                        "winner": newPlayoff.winner
                      }; 
        return this.http.post('http://localhost:3000/playoffs', payload, httpOptions);
    }

    updatePlayoff(playoff: Object, bracket: Array<Object>, playInRound: Array<Object>) {
        let newBracket = Object.assign([], bracket);
        newBracket.unshift(playInRound);
        console.log(newBracket);
        return this.http.patch('http://localhost:3000/playoffs/' + playoff['id'],
        {
            "bracket": newBracket
        });
    }

    updateGame(id, winner, differential): Observable<any> {
        return this.http.patch('http://localhost:3000/games/' + id,
        {
            "winner": winner,
            "differential": differential
        });
    }

    toggleDefined(id): Observable<any> {
        return this.http.patch('http://localhost:3000/tournaments/' + id,
        {
            "playoffDefined": true
        });
    }
    
    // NOTE: Also deletes corresponding pools, games, and playoffs. 
    deleteTournament(tournament, name) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        this.http.delete('http://localhost:3000/pools/' + tournament.id, httpOptions).subscribe();
        return this.http.delete('http://localhost:3000/tournaments/' + tournament.id, httpOptions);
    }
}
