import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Playoff} from '../Playoffs/playoff';
import {environment} from '../../environments/environment';
import {SinglesPlayoff} from '../Playoffs/singles-playoff';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class PlayoffService {

  constructor(private http: HttpClient) {
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
}
