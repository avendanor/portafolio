import { TestBed } from '@angular/core/testing';

import { AnimationsService } from './animations.service';

describe('EngineService', () => {
  let service: AnimationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
