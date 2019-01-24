import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Tournament } from '../Tournaments/tournament';
import { Pool } from '../Pools/pool';
import { Playoff } from '../Playoffs/playoff';
import { environment } from 'environments/environment';

@Injectable()
export class TournamentService {

    constructor(private http: HttpClient) {}

    tournaments: Tournament[];

    populateWithTournaments(ob: any[]): Tournament[] {
        const tournaments = [];
        for (const piece of ob) {
            tournaments.push(
                new Tournament(
                                piece['id'],
                                piece['playoffDefined'],
                                piece['winner'],
                                piece['name'],
                                piece['singles'],
                                piece['size'],
                                piece['teams']
                            ));
        }
        return tournaments;
    }

    endTournament (id, winner, winnerName) {
        this.declarePlayoffWinner(id, winner).subscribe();
        return this.http.patch(environment.api_url + '/tournaments/' + id,
        {
            'winner': winnerName
        });
    }

    declarePlayoffWinner(id, winner) {
        return this.http.patch(environment.api_url + '/playoffs/' + id,
        {
            'winner': winner,
            'ended': true
        });
    }

    getTournaments(): Observable<Tournament[]> {
        if (this.tournaments !== undefined && this.tournaments.length > 0) {
            return Observable.of(this.tournaments);
        } else {
           return this.http.get(environment.api_url + '/tournaments').map(this.populateWithTournaments);
        }
    }

    getTournament(name): Observable<Object> {
        if (typeof(name) === 'number') {
            return this.http.get(environment.api_url + '/tournaments/' + name);
        }
        return this.http.get(environment.api_url + '/tournaments?name=' + name);
    }

    getPlayoff(id): Observable<Object> {
        return this.http.get(environment.api_url + '/playoffs/' + id);
    }


    addTournament(newTournament: Tournament) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        const payload = { 'name': newTournament.name,
                        'playoffDefined': newTournament.playoffDefined,
                        'singles': newTournament.singles,
                        'size': newTournament.size,
                        'teams': newTournament.teams,
                      };
        return this.http.post(environment.api_url + '/tournaments', payload, httpOptions);
    }

    addPool(newPool: Pool) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        const payload = {
                        'tournamentId': newPool.tournamentId,
                        'pools': newPool.pools,
                        'tournyName': newPool.tournyName
                      };
        return this.http.post(environment.api_url + '/pools', payload, httpOptions);
    }

    addPlayoff(newPlayoff: Playoff) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        const payload = {
                        'id': newPlayoff.id,
                        'tournamentId': newPlayoff.tournamentId,
                        'playInSpots': newPlayoff.playInSpots,
                        'bracket': newPlayoff.bracket,
                        'winner': newPlayoff.winner,
                        'ended': newPlayoff.ended
                      };
        return this.http.post(environment.api_url + '/playoffs', payload, httpOptions);
    }

    updatePlayoff(playoff: Object, bracket: Array<Object>, playInRound: Array<Object>) {
        const newBracket = Object.assign([], bracket);
        newBracket.unshift(playInRound);
        return this.http.patch(environment.api_url + '/playoffs/' + playoff['id'],
        {
            'bracket': newBracket,
            'winner': playoff['winner'],
            'ended': playoff['ended']
        });
    }

    toggleDefined(id): Observable<any> {
        return this.http.patch(environment.api_url + '/tournaments/' + id,
        {
            'playoffDefined': true
        });
    }

    // NOTE: Also deletes corresponding pools, games, and playoffs.
    deleteTournament(tournament, name) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        return this.http.delete(environment.api_url + '/tournaments/' + tournament.id, httpOptions);
    }
}
