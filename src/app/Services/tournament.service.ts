import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Tournament } from '../Tournaments/tournament';
import { SinglesPool } from '../Pools/singles-pool';
import { Playoff } from '../Playoffs/playoff';
import { environment } from 'environments/environment';
import {SinglesTournament} from '../Tournaments/singles-tournament';
import {DoublesTournament} from '../Tournaments/doubles-tournament';
import {SinglesGame} from '../Games/singles-game';

@Injectable()
export class TournamentService {

    constructor(private http: HttpClient) {}

    tournaments: Tournament[];

    populateWithSinglesTournaments(response: any[]): SinglesTournament[] {
        const tournaments = [];
        for (const jsonTourny of response) {
          const retrievedTourny = new SinglesTournament(jsonTourny['name'], jsonTourny['size'], jsonTourny['rounds']);
          retrievedTourny.id = jsonTourny['id'];
          retrievedTourny.playoffsStarted = jsonTourny['playoffs_started'];
          retrievedTourny.winner = jsonTourny['winner'];
          retrievedTourny.currentRound = jsonTourny['current_round'];
          tournaments.push(retrievedTourny);
        }
        return tournaments;
    }

  populateWithDoublesTournaments(response: any[]): DoublesTournament[] {
      const tournaments = [];
      for (const jsonTourny of response) {
        const retrievedTourny = new DoublesTournament(jsonTourny['name'], jsonTourny['size'], jsonTourny['rounds']);
        retrievedTourny.id = jsonTourny['id'];
        retrievedTourny.playoffsStarted = jsonTourny['playoffs_started'];
        retrievedTourny.winner1 = jsonTourny['winner1'];
        retrievedTourny.winner2 = jsonTourny['winner2'];
        retrievedTourny.currentRound = jsonTourny['current_round'];
        tournaments.push(retrievedTourny);
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

    getSinglesTournaments(): Observable<SinglesTournament[]> {
      return this.http.request('get', '/api/tournaments/singles/get', {
        headers: {
          'Content-Type': 'application/json'}
      }).map(this.populateWithSinglesTournaments);
    }

    getDoublesTournaments(): Observable<DoublesTournament[]> {
      return this.http.request('get', '/api/tournaments/doubles/get', {
        headers: {
          'Content-Type': 'application/json'}
      }).map(this.populateWithDoublesTournaments);
    }

    getTournament(id, type): Observable<Object> {
      if (type === 'singles') {
        return this.http.request('get', '/api/tournaments/singles/get/' + id, {
          headers: {
            'Content-Type': 'application/json'}
        });
      } else {
        return this.http.request('get', '/api/tournaments/doubles/get/' + id, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }

  updateSinglesTournamentRound(tournyId: number, round: number): Observable<any> {
    const payload = {
      'current_round': round
    };
    return this.http.request('post', '/api/tournaments/singles/update_round/' + tournyId, {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  updateDoublesTournamentRound(tournyId: number, round: number): Observable<any> {
    const payload = {
      'current_round': round
    };
    return this.http.request('post', '/api/tournaments/doubles/update_round/' + tournyId, {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  addSinglesTournament(newTournament: SinglesTournament): Observable<Object> {
      const payload = { 'name': newTournament.name,
                        'size': newTournament.size,
                        'rounds': newTournament.rounds
                      };
      return this.http.request('post', '/api/tournaments/singles/post', {
        body: payload,
        headers: {
          'Content-Type': 'application/json'
        }
      });
  }

  addDoublesTournament(newTournament: DoublesTournament) {
    const payload = { 'name': newTournament.name,
      'size': newTournament.size,
      'rounds': newTournament.rounds
    };
    return this.http.request('post', '/api/tournaments/doubles/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  updateSinglesPlayoff(tournyId) {
    return this.http.request('post', '/api/tournaments/singles/update_playoffs/' + tournyId, {
      body: '',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  updateDoublesPlayoff(tournyId) {
    return this.http.request('post', '/api/tournaments/doubles/update_playoffs/' + tournyId, {
      body: '',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

    // NOTE: Also deletes corresponding pools, games, and playoffs.
    deleteTournament(tournament, name) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        if(tournament instanceof SinglesTournament) {
          return this.http.delete('/api/tournaments/singles/' + tournament.id, httpOptions);
        }
        if(tournament instanceof DoublesTournament) {
          return this.http.delete('/api/tournaments/doubles/' + tournament.id, httpOptions);
        }
    }

}
