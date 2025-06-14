import { TestBed } from '@angular/core/testing';

import { ActiveTabService } from './active-tab.service';

describe('ActiveTabService', () => {
  let service: ActiveTabService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveTabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
