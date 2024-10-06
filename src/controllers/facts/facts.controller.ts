import { Body, Controller, Get, Inject, NotAcceptableException, NotFoundException, Param, Post } from '@nestjs/common';
import { Fact } from 'src/database/models/fact.model';
import { FactService } from 'src/services/facts/fact.service';

import { LoggerService } from 'src/services/logger.service';

@Controller('facts')
export class FactsController {

    constructor (private readonly factService: FactService, private readonly loggerService: LoggerService) {}

    @Get('location/:address/:langlat')
    private async getLocationInfo(@Param('address') _add: string, @Param('langlat') _gc: string) {
        try {
            const newGC = JSON.parse(_gc)
            if(!_add || !_gc) throw new NotFoundException("Address or longitude not provided");
            const cRating = await this.factService.getLocationRating({_add, _gc: newGC});
            return {payload: cRating, msg: "successfully fetched Cleaniness Rating", err: null}
        } catch (er) {
            this.loggerService.error(er);
            return {payload: null, msg: er.message, err: er}
        } 
    }

    @Post('create')
    private async createLocationInfo(@Body() createLocationRatingData: Fact) {
        try {
            if(!createLocationRatingData) throw new NotAcceptableException("Rating data is invalid or empty");
            const result = await this.factService.createLocationReport(createLocationRatingData);
            return {payload: result, msg: "successfully submitted your review", err: null}
        } catch (er) {
            this.loggerService.error(er);
            return {payload: null, msg: er.message, err: er}
        }
    }

    @Get('my-reviews/:usrId')
    private async getMyReviews(@Param('usrId') usrId: string) {
        try {
            if(!usrId) throw new NotAcceptableException("User Id is invalid or empty");
            const reviews = await this.factService.getMyReviews(usrId);
            const result = await this.factService.getCummRating(reviews);
            return {payload: result, msg: "My reviews successfully fetched", err: null}
        } catch (er) {
            this.loggerService.error(er);
            return {payload: null, msg: er.message, err: er}
        } 
    }
}
