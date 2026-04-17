import { Injectable } from '@nestjs/common';

@Injectable()
export class BattleService {
  setMatchGrade(type: string, grade: string[] = []): Array<string | number> {
    if (type === '0') {
      return grade;
    }

    return grade.flatMap((num) => {
      const gradeNumber = Number(num);
      if (!Number.isFinite(gradeNumber)) {
        return [];
      }

      const matchGrades = [gradeNumber * 3 + 1];
      if (num !== '6') {
        matchGrades.push(gradeNumber * 3 + 2, gradeNumber * 3 + 3);
      }

      return matchGrades;
    });
  }
}
