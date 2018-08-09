import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { PlayoffsComponent } from './playoffs.component';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TournamentService } from '../Services/tournament.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Mock } from 'protractor/built/driverProviders';
import { PlayerService } from '../Services/player.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { GameService } from '../Services/game.service';
import { EloService } from '../Services/elo.service';
import Spy = jasmine.Spy;
import { Game } from '../Games/game';


@Injectable()
class MockTournyService {
    getPlayoff(id): Observable<any> {
        return Observable.of({
            'winner': 2,
            'ended': true,
            'bracket': [[{'team': [1, 2]}, {'team': [3, 4]}], [{'team': [5, 6]}, {'team': [7, 8]}]]
        })
    }
}

@Injectable()
class MockRouter {
  navigateByUrl(url: string) { }
}

@Injectable()
class MockActivatedRoute {
  snapshot = {
    paramMap: {
      get: function (key: string) {
        return '1';
      }
    }
  }
}

@Injectable()
class MockPlayerService {
  getPlayers() {
    return Observable.of({});
  }
}

@Injectable()
class MockGameService {
}

@Injectable()
class MockEloService {
}


describe('PlayoffsComponent', () => {
  let component: PlayoffsComponent;
  let fixture: ComponentFixture<PlayoffsComponent>;
  let playerServiceSpy: Spy;
  let getPlayoffGamesSpy: Spy;
  let constructPlayoffsSpy: Spy;
  let initSpy: Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PlayoffsComponent
      ],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [{provide: TournamentService, useClass: MockTournyService},  
                  {provide: PlayerService, useClass: MockPlayerService},
                {provide: ActivatedRoute, useClass: MockActivatedRoute},
                {provide: Router, useClass: MockRouter},
                {provide: PlayerService, useClass: MockPlayerService},
                {provide: GameService, useClass: MockGameService},
                {provide: EloService, useClass: MockEloService},
                HttpClient, HttpHandler, NgbTooltipConfig]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayoffsComponent);
    component = fixture.componentInstance;
    getPlayoffGamesSpy = spyOn(component, 'getPlayoffGames').and.callFake(function() {return{}});
    playerServiceSpy = spyOn(component._playerService, 'getPlayers').and.callThrough();
    constructPlayoffsSpy = spyOn(component, 'constructPlayoff')
    fixture.detectChanges();
  });

  it('should create the component', async(() => {
    expect(component).toBeTruthy();
    expect(playerServiceSpy).toHaveBeenCalled();
  }));

  it ('should correctly construct the playoffs', () => {
      constructPlayoffsSpy.and.callThrough();

      component.constructPlayoff();

      expect(component.tournamentWinner).toEqual(2);
      expect(component.isOver).toEqual(true);
      expect(component.playInRound).toEqual([{'team': [1, 2]}, {'team': [3, 4]}]);
      expect(component.bracket).toEqual([[{'team': [5, 6]}, {'team': [7, 8]}]]);
      expect(component.tournyType).toEqual('doubles');
      expect(getPlayoffGamesSpy).toHaveBeenCalled();
  });

  it ('should submit a game', () => {
    component.validator = "team2";
    component.playoffId = "1";
    component.scoreDifferential = 2;
    component.newPlayoffGames = [];
    component.modalWinner = {'team': 3};
    component.modalLoser = {'team': 4};

    component.submitGame();

    expect(component.newPlayoffGames.length).toEqual(1);
    expect(component.newPlayoffGames[0]['validator']).toEqual(4);
    expect(component.newPlayoffGames[0]['team1']).toEqual(3);
    expect(component.newPlayoffGames[0]['team2']).toEqual(4);
    expect(component.newPlayoffGames[0]['winner']).toEqual(3);
});
});