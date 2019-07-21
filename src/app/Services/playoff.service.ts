import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Playoff} from '../Playoffs/playoff';
import {environment} from '../../environments/environment';
import {SinglesPlayoff} from '../Playoffs/singles-playoff';
import {Observable} from 'rxjs/Observable';
import {SinglesTournament} from '../Tournaments/singles-tournament';
import {DoublesPlayoff} from '../Playoffs/doubles-playoff';
import {SinglesBracketNode} from '../Brackets/singles-bracket-node';
import {DoublesBracketNode} from '../Brackets/doubles-bracket-node';

@Injectable()
export class PlayoffService {

  constructor(private http: HttpClient) {
  }

  populateWithSinglesPlayoff(response: any[]): SinglesTournament[] {
    const playoffs = [];
    for (const jsonPlayoff of response) {
      const retrievedPlayoff = new SinglesPlayoff(undefined);
      retrievedPlayoff.id = jsonPlayoff['id'];
      retrievedPlayoff.tournamentId = jsonPlayoff['tourny_id'];
      retrievedPlayoff.winner = jsonPlayoff['winner'];
      retrievedPlayoff.ended = jsonPlayoff['ended'];
      playoffs.push(retrievedPlayoff);
    }
    return playoffs;
  }

  populateWithDoublesPlayoff(response: any[]): SinglesTournament[] {
    const playoffs = [];
    for (const jsonPlayoff of response) {
      const retrievedPlayoff = new DoublesPlayoff(undefined);
      retrievedPlayoff.id = jsonPlayoff['id'];
      retrievedPlayoff.tournamentId = jsonPlayoff['tourny_id'];
      retrievedPlayoff.winner1 = jsonPlayoff['winner1'];
      retrievedPlayoff.winner2 = jsonPlayoff['winner2'];
      retrievedPlayoff.ended = jsonPlayoff['ended'];
      playoffs.push(retrievedPlayoff);
    }
    return playoffs;
  }

  addSinglesPlayoff(tournyId: number): Observable<Object> {
    const payload = { 'tourny_id': tournyId };
    return this.http.request('post', '/api/playoffs/singles/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  addDoublesPlayoff(tournyId: number): Observable<Object> {
    const payload = { 'tourny_id': tournyId };
    return this.http.request('post', '/api/playoffs/doubles/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getPlayoff(id: number, type: string): Observable<any> {
    if (type === 'singles') {
      return this.http.request('get', '/api/playoffs/singles/get/' + id, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).map(this.populateWithSinglesPlayoff);
    } else {
      return this.http.request('get', '/api/playoffs/doubles/get/' + id, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).map(this.populateWithDoublesPlayoff);
    }
  }
}
