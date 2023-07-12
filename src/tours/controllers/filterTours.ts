import { Request, Response } from "express";
import Tour from "../../models/tour/tourModel";
import Category from "../../models/categoryModel";
import { ObjectId } from "mongoose";
import Schedule from "../../models/schedule/scheduleModel";
import { ICategoryDocument } from "../../types/category.interface";

interface IQuery {
    category?: string,
    price?: string,
    people?: string,
    startDate?: string,
    endDate?: string,
    page?: string,
    limit?: string,
}

async function filterTours(req: Request, res: Response) {
    const { category, price, people, startDate, endDate, page, limit }: IQuery  = req.query;

    let tourIds: ObjectId[] = [];
    let scheduleIdsArray: string[] = [];
    let categoryDoc: ICategoryDocument | null = null;

    if(!page || !limit ) {
        res.status(400);
        throw new Error('Please provide page and limit');
    };

    const limitNumber = parseInt(limit);
    const skip = (parseInt(page) - 1) * limitNumber;

    if(price || people || startDate || endDate) {
        const schedules = await Schedule.find({
            ...(price && { price: { $lte: Number(price) } }),
            ...(people && { availability: { $gte: Number(people) } }),
            ...(startDate && { startDate: { $gte: new Date(startDate) } }),
            ...(endDate && { endDate: { $lte: new Date(endDate) } }),
        }).skip(skip).limit(limitNumber);

        if(schedules.length === 0) {
            res.status(404);
            throw new Error('Tours not found');
        };

        schedules.map(schedule => {
            tourIds.push(schedule.tourId);
            scheduleIdsArray.push(schedule._id.toString());
        });
    }

    if (category) {
        const categoryDB = await Category.findOne({ slug: category })
        if(categoryDB === null) {
            res.status(404);
            throw new Error("Category not found")
        };
        categoryDoc = categoryDB;
    }

    const filteredTours = await Tour.find({
        ...(tourIds.length > 0 && { _id: { $in: tourIds } }),
        ...(categoryDoc && { category: categoryDoc._id }),
    }).populate("scheduleIds").skip(skip).limit(limitNumber);
    
    if(filteredTours === null) {
        res.status(404);
        throw new Error("Tours not found");
    };

    if(scheduleIdsArray.length > 0) {
        filteredTours.map(tour => {
            tour.scheduleIds = tour.scheduleIds.filter((schedule: any) => {
                return scheduleIdsArray.includes(schedule._id.toString());
            });
        });
    };

    res.status(200).json(filteredTours);
};

export default filterTours;