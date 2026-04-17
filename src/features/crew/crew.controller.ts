import { Controller, Get, Param } from '@nestjs/common';

import { CrewService } from './crew.service';

@Controller('crew')
export class CrewController {
  constructor(private readonly crewService: CrewService) {}

  @Get('/members')
  async selectMembersTable() {
    return this.crewService.selectMemberTable();
  }

  @Get('/members/:id')
  async selectMember(@Param('id') id: string) {
    const { friendList } = await this.crewService.selectMemberFriends(id);
    return {
      friendList,
      seasonList: await this.crewService.selectMemberSeasons(id)
    };
  }
}
