import { BattleService } from './battle.service';

describe('BattleService', () => {
  let service: BattleService;

  beforeEach(() => {
    service = new BattleService();
  });

  describe('setMatchGrade', () => {
    it('returns trophy grades unchanged for trophy battle type', () => {
      expect(service.setMatchGrade('0', ['4', '5', '6'])).toEqual([
        '4',
        '5',
        '6'
      ]);
    });

    it('expands ranked grades to crawler match grade buckets', () => {
      expect(service.setMatchGrade('2', ['4', '6'])).toEqual([
        13,
        14,
        15,
        19
      ]);
    });

    it('returns an empty list when no valid grade is selected', () => {
      expect(service.setMatchGrade('2', [])).toEqual([]);
      expect(service.setMatchGrade('2', ['invalid'])).toEqual([]);
    });
  });
});
