import { Request, Response } from "express";
import Tour from "../../models/tourModel";
import Category from "../../models/categoryModel";
import { Types } from "mongoose";

interface ISearchCriteria {
    schedule?: {
        $elemMatch: {
            price?: { $lte: number };
            startDate?: {$gte: Date};
            endDate?: {$lte: Date};
            availability?: { $gte: number };
        }
    };
    category?: Types.ObjectId;
}

interface IQuery {
    category?: string,
    price?: string,
    people?: string,
    startDate?: string,
    endDate?: string,
}

async function filterTours(req: Request, res: Response) {
    const { category, price, people, startDate, endDate }: IQuery  = req.query;

  // Tworzenie obiektu z kryteriami wyszukiwania na podstawie przekazanych parametrów zapytania
  let searchCriteria: ISearchCriteria = {};

    if(price || people || startDate || endDate) {
        searchCriteria = {
            schedule: {
                $elemMatch: {
                    ...(price && { price: { $lte: Number(price) } }),
                    ...(people && { availability: { $gte: Number(people) } }),
                    ...(startDate && { startDate: { $gte: new Date(startDate) } }),
                    ...(endDate && { endDate: { $lte: new Date(endDate) } }),
                }
            }
        }
    }

    if (category) {
        const categoryDB = await Category.findOne({ slug: category })
        if(categoryDB === null) {
            res.status(404);
            throw new Error("Category not found")
        };
        searchCriteria.category = categoryDB._id;
    }

    console.log(searchCriteria);

    const filteredTours = await Tour.find(searchCriteria);
    
    if(filteredTours === null) {
        res.status(404);
        throw new Error("Tours not found");
    };

    res.status(200).json(filteredTours);
};

export default filterTours;