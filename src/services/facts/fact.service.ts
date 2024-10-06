import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Fact } from 'src/database/models/fact.model';
import { Facts } from 'src/database/schemas/facts.schema';
import { LoggerService } from 'src/services/logger.service';

@Injectable()
export class FactService {
  constructor(
    @InjectModel('Fact') private readonly factModel: Model<Facts>,
    private logger: LoggerService,
  ) {}

  async createLocationReport(ratingData: Fact | Record<string, any>) {
    try {
      return await this.factModel.create(ratingData);
    } catch (er) {
      throw new InternalServerErrorException(er);
    }
  }

  async getMyReviews(uid: string | Types.ObjectId) {
    try {
      return await this.factModel
        .find({ createdBy: uid })
        .sort({ createdAt: -1 })
        .exec();
    } catch (er) {
      throw new InternalServerErrorException(er);
    }
  }

  async getCummRating(reviews: Array<Fact>) {
    try {
      return [
        reviews.map((report: Fact) => {
          return {
            ...report,
            cRating: (
              (Number(report.wod) +
                Number(report.wafc) +
                Number(report.wc) +
                Number(report.dd) +
                Number(report.ddistro) +
                Number(report.dn) +
                Number(report.pests) +
                Number(report.greenery)) /
              8
            ).toFixed(2),
          };
        }),
      ];
    } catch (er) {
      throw new InternalServerErrorException(er);
    }
  }

  /**
   *
   * @param sq Record<string, any> search query containing address and langitude and latitudes of the place
   */
  async getLocationRating(sq: {
    _add: string;
    _gc: { lang: number; lat: number } | string;
  }) {
    try {
      const reports: Array<Fact> = await this.factModel
        .find({ _add: sq._add })
        .exec();
      let odour = 0,
        color = 0,
        algaeContent = 0,
        dustbinDivision = 0,
        dustbinNumber = 0,
        dustbinDistrobution = 0,
        pests = 0,
        greenery = 0; // ratings for different components in cleaniness report - we take average (can take weighted average by introducing sorted data based on recency and indexes)

      let dtlen = reports.length;
      if (reports.length > 0) {
        console.log('enter');

        reports.map((report: Fact) => {
          odour += Number(report.wod);
          color += Number(report.wc);
          algaeContent += Number(report.wafc);
          dustbinDistrobution += Number(report.ddistro);
          dustbinDivision += Number(report.dd);
          dustbinNumber += Number(report.dn);
          pests += Number(report.pests);
          greenery += Number(report.greenery);
        });

        const cleanRating = Number(
          (
            (odour / dtlen +
              color / dtlen +
              algaeContent / dtlen +
              dustbinDistrobution / dtlen +
              dustbinDivision / dtlen +
              dustbinNumber / dtlen +
              pests / dtlen +
              pests / dtlen +
              greenery / dtlen) /
            8
          ).toFixed(2),
        );
        console.log(cleanRating);

        return cleanRating;
      } else {
        // No data exists
        console.log('enter');

        odour = Math.max(Math.random() * 5, 1);
        color = Math.max(Math.random() * 5, 1);
        algaeContent = Math.max(Math.random() * 5, 1);
        dustbinDistrobution = Math.max(Math.random() * 5, 1);
        dustbinDivision = Math.max(Math.random() * 5, 1);
        dustbinNumber = Math.max(Math.random() * 5, 1);
        pests = Math.max(Math.random() * 5, 1);
        greenery = Number(Math.max(Math.random() * 5, 1));
        console.log(
          odour,
          color,
          algaeContent,
          dustbinDistrobution,
          dustbinDivision,
          dustbinNumber,
          pests,
          greenery,
        );

        await this.createLocationReport({
          createdBy: 'satcom',
          _gc: sq._gc,
          _add: sq._add,
          wod: odour,
          wc: color,
          wafc: algaeContent,
          ddistro: dustbinDistrobution,
          dd: dustbinDivision,
          dn: dustbinNumber,
          pests: pests,
          greenery: greenery,
          _nm: sq._add,
          isSuspended: false,
        });

        dtlen = 1;
      }

      const cleanRating = Number(
        (
          (odour / dtlen +
            color / dtlen +
            algaeContent / dtlen +
            dustbinDistrobution / dtlen +
            dustbinDivision / dtlen +
            dustbinNumber / dtlen +
            pests / dtlen +
            pests / dtlen +
            greenery / dtlen) /
          8
        ).toFixed(2),
      );
      console.log(cleanRating);

      return cleanRating;
    } catch (er) {
      throw new InternalServerErrorException(er);
    }
  }
}
