import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import {SinglesRound} from '../Rounds/singles-round';
import {Observable} from 'rxjs/Observable';
import {DoublesRound} from '../Rounds/doubles-round';

@Injectable()
export class TournamentSetupService {

  constructor(private http: HttpClient) {}

  createSinglesRounds(numberOfRounds, size, tournamentId) {
    const firstRound = new SinglesRound(tournamentId, size, 1);
    this.addSinglesRound(firstRound).subscribe();
    if (numberOfRounds > 1) {
      const secondRound = new SinglesRound(tournamentId, size, 2);
      this.addSinglesRound(secondRound).subscribe();
    }
  }

  addSinglesRound(round: SinglesRound): Observable<Object> {
    const payload = { 'tournamentId': round.tournamentId,
                      'size': round.size,
                      'number': round.number
                    };
    return this.http.request('post', '/api/rounds/singles/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  createDoublesRounds(numberOfRounds, size, tournamentId) {
    const firstRound = new DoublesRound(tournamentId, size, 1);
    this.addDoublesRound(firstRound).subscribe();
    if (numberOfRounds > 1) {
      const secondRound = new DoublesRound(tournamentId, size, 2);
      this.addDoublesRound(secondRound).subscribe();
    }
  }

  addDoublesRound(round: DoublesRound): Observable<Object> {
    const payload = { 'tournamentId': round.tournamentId,
      'size': round.size,
      'number': round.number
    };
    return this.http.request('post', '/api/rounds/doubles/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  createSinglesPools() {
  }


}
