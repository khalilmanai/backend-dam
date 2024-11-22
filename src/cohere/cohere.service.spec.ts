import { Test, TestingModule } from '@nestjs/testing';
import { CohereService } from './cohere.service';

describe('CohereService', () => {
  let service: CohereService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CohereService],
    }).compile();

    service = module.get<CohereService>(CohereService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
