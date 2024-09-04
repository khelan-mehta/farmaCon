import { Injectable } from '@nestjs/common';
import { Model, Document } from 'mongoose';

@Injectable()
export class PaginationService {
  async paginate<T extends Document>(
    model: Model<T>,
    query: any = {},
    { page = 1, pageSize = 10 }: { page?: number; pageSize?: number },
  ): Promise<{ data: T[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    console.log(`Pagination parameters - page: ${page}, pageSize: ${pageSize}, skip: ${skip}, limit: ${limit}`);

    const results = await model.find(query).skip(skip).limit(limit).exec();
    const total = await model.countDocuments(query);

    console.log(`Query executed: ${results.length} results found out of ${total} total documents`);

    return { data: results, total };
  }
}
