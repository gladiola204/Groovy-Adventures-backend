import { Request, Response } from "express";
import Tour from "../../models/tourModel";
import User from "../../models/userModel";

async function purchaseTour(req: Request, res: Response) {
    const { slug } = req.params;

    const tour = await Tour.findOne({ slug });

    if(tour === null) {
        res.status(404);
        throw new Error("Tour not found");
    };

    const purchaseTour = await User.findByIdAndUpdate(req.user?._id, {
        $push: { purchasedTourIds: tour._id }
    }, {
        runValidators: true,
        new: true,
    });

    if(purchaseTour === null) {
        res.status(404);
        throw new Error("User not found");
    };

    tour.purchasesCount += 1;
    await tour.save();

    res.status(200).json({
        success: true,
        message: "User purchased tour succesfully",
        purchasedTourIds: purchaseTour.purchasedTourIds,
    })

};

export default purchaseTour;