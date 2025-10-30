import { TestBed } from '@angular/core/testing';

import { ExecutionsService } from './executions-service';

describe('ExecutionsService', () => {
  let service: ExecutionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExecutionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
