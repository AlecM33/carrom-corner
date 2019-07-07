import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import {SinglesRound} from '../Rounds/singles-round';
import {Observable} from 'rxjs/Observable';
import {DoublesRound} from '../Rounds/doubles-round';
import {forkJoin} from 'rxjs/observable/forkJoin';
import {SinglesPool} from '../Pools/singles-pool';
import {DoublesPool} from '../Pools/doubles-pool';

@Injectable()
export class TournamentSetupService {

  constructor(private http: HttpClient) {}

  createSinglesRound(roundNumber, size, tournamentId): Observable<Object> {
    const round = new SinglesRound(tournamentId, size, 1);
    return this.addSinglesRound(round);
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

  createDoublesRound(numberOfRounds, size, tournamentId): Observable<Object> {
    const round = new DoublesRound(tournamentId, size, 1);
    return this.addDoublesRound(round);
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

  createSinglesPools(roundId: number, size: number): Observable<Object[]> {
    let optimalGroupSize = 0;
    if (size <= 16) {
      optimalGroupSize = 4;
    } else if (size > 16 && size < 24) {
      optimalGroupSize = 5;
    } else {
      optimalGroupSize = 6;
    }
    const observablesArray: Observable<Object>[] = [];
    const sameSizePools = Math.floor(size / optimalGroupSize);
    for (let i = 0; i < sameSizePools; i++) {
      const newPool = new SinglesPool(roundId, i + 1);
      observablesArray.push(this.addSinglesPool(newPool));
    }
    return forkJoin(...observablesArray);
  }

  addSinglesPool(pool: SinglesPool): Observable<Object> {
    const payload = {
      'roundId': pool.roundId,
      'number': pool.number
    };
    return this.http.request('post', '/api/pools/singles/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  createDoublesPools(roundId: number, size: number) {
    let optimalGroupSize = 0;
    if (size <= 16) {
      optimalGroupSize = 4;
    } else if (size > 16 && size < 24) {
      optimalGroupSize = 5;
    } else {
      optimalGroupSize = 6;
    }
    const observablesArray: Observable<Object>[] = [];
    const sameSizePools = Math.floor(size / optimalGroupSize);
    for (let i = 0; i < sameSizePools; i++) {
      const newPool = new DoublesPool(roundId, i + 1);
      observablesArray.push(this.addDoublesPool(newPool));
    }
    return forkJoin(...observablesArray);
  }

  addDoublesPool(pool: DoublesPool): Observable<Object> {
    const payload = {
      'roundId': pool.roundId,
      'number': pool.number
    };
    return this.http.request('post', '/api/pools/doubles/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }


}
