import { Test, TestingModule } from '@nestjs/testing';
import { CohereController } from './cohere.controller';

describe('CohereController', () => {
  let controller: CohereController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CohereController],
    }).compile();

    controller = module.get<CohereController>(CohereController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
