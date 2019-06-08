import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TournamentService } from '../Services/tournament.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlayerService } from '../Services/player.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { GameService } from '../Services/game.service';
import { EloService } from '../Services/elo.service';
import Spy = jasmine.Spy;
import { ViewTournamentComponent } from './view-tournament.component';
import { BracketService } from '../Services/bracket.service';


@Injectable()
class MockTournyService {
    getPlayoff(id): Observable<any> {
        return Observable.of({
            'winner': 2,
            'ended': true,
            'bracket': [[{'team': [1, 2]}, {'team': [3, 4]}], [{'team': [5, 6]}, {'team': [7, 8]}]]
        });
    }
}

@Injectable()
class MockRouter {
  navigateByUrl(url: string) { }
  events = Observable.of(new NavigationEnd(2, '', ''));
}

@Injectable()
class MockActivatedRoute {
  snapshot = {
    paramMap: {
      get: function (key: string) {
        return '1';
      }
    }
  };
}

@Injectable()
class MockPlayerService {
  getPlayers() {
    return Observable.of({});
  }
}

@Injectable()
class MockBracketService {

}

@Injectable()
class MockGameService {
  getGames(id: number) {
    return Observable.of([{'winner': 1 , 'scheduleIndex': 5}, {'winner': undefined , 'scheduleIndex': 13}, {'winner': 6 , 'scheduleIndex': 1}, {'winner': undefined , 'scheduleIndex': 12}]);
  }
}

@Injectable()
class MockEloService {
}

@Injectable()
class MockHttpClient {
  get(url: string, body: any, options: any) {
    return;
  }
}


describe('ViewTournamentComponent', () => {
  let component: ViewTournamentComponent;
  let fixture: ComponentFixture<ViewTournamentComponent>;
  let playerServiceSpy: Spy;
  let routerSpy: Spy;
  let rosterSpy: Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ViewTournamentComponent
      ],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [{provide: TournamentService, useClass: MockTournyService},
                  {provide: PlayerService, useClass: MockPlayerService},
                {provide: ActivatedRoute, useClass: MockActivatedRoute},
                {provide: Router, useClass: MockRouter},
                {provide: PlayerService, useClass: MockPlayerService},
                {provide: GameService, useClass: MockGameService},
                {provide: EloService, useClass: MockEloService},
                {provide: BracketService, useClass: MockBracketService},
                {provide: HttpClient, useClass: MockHttpClient},
                NgbTooltipConfig]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTournamentComponent);
    component = fixture.componentInstance;
    playerServiceSpy = spyOn(component._playerService, 'getPlayers').and.callThrough();
    rosterSpy = spyOn(component, 'getTournyRoster').and.callFake(function() {});
    fixture.detectChanges();
  });

  it('should create the component', async(() => {
    expect(component).toBeTruthy();
    expect(playerServiceSpy).toHaveBeenCalled();
    expect(rosterSpy).toHaveBeenCalled();
  }));

  it('should retrieve and sort the tournament games', () => {
      const generateStandingsSpy = spyOn(component, 'generateStandings').and.callFake(function() {});

      component.getTournyGames();

      expect(component.playedGames).toEqual([{'winner': 1 , 'scheduleIndex': 5}, {'winner': 6 , 'scheduleIndex': 1}]);
      expect(component.unplayedGames).toEqual([{'winner': undefined , 'scheduleIndex': 12}, {'winner': undefined , 'scheduleIndex': 13}]);
      expect(component.disabled).toEqual(true);
  });

  it('should enable the playoff button when all games are played', () => {
    component.games = [{'winner': 1 , 'scheduleIndex': 5}, {'winner': 2 , 'scheduleIndex': 13}, {'winner': 6 , 'scheduleIndex': 1}, {'winner': 4 , 'scheduleIndex': 12}];

    component.disabled = component.isDisabled();

    expect(component.disabled).toEqual(false);
  });

  it('should filter games list based on the user\'s filter string', () => {
    component.players = [{'name': 'Ben', 'id': 13}, {'name': 'Adam', 'id': 24}, {'name': 'Bob', 'id': 8}, {'name': 'Brenda', 'id': 2}];
    const input = 'a', list = 'played';
    component.games = [
      {'winner': 8 , 'team1': 13, 'team2': 8},
      {'winner': 15 , 'team1': 15, 'team2': 1},
      {'winner': undefined , 'team1': 24, 'team2': 8},
      {'winner': 24, 'team1': 24, 'team2': 5},
      {'winner': 1 , 'team1': 1, 'team2': 30},
      {'winner': 4 , 'team1': 2, 'team2': 4},
      {'winner': 6 , 'team1': 6, 'team2': 4},
      {'winner': 21, 'team1': 21, 'team2': 22},
      {'winner': 5, 'team1': 4, 'team2': 5},
      {'winner': undefined, 'team1': 15, 'team2': 16},
      {'winner': undefined, 'team1': 19, 'team2': 3}
    ];
    component.playedGames = [
        {'winner': 8 , 'team1': 13, 'team2': 8},
        {'winner': 15 , 'team1': 15, 'team2': 1},
        {'winner': undefined , 'team1': 24, 'team2': 8},
        {'winner': 24, 'team1': 24, 'team2': 5},
        {'winner': 1 , 'team1': 1, 'team2': 30},
        {'winner': 4 , 'team1': 2, 'team2': 4},
        {'winner': 6 , 'team1': 6, 'team2': 4},
        {'winner': 21, 'team1': 21, 'team2': 22},
        {'winner': 5, 'team1': 4, 'team2': 5}
      ];

    component.filterGames(input, list);

    expect(component.playedGames).toEqual([{'winner': 24, 'team1': 24, 'team2': 5}, {'winner': 4 , 'team1': 2, 'team2': 4}]);
  });

});
