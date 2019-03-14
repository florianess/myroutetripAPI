const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const Trip = require('../../models/trip');
const User = require('../../models/user');
const Step = require('../../models/step');

const client = new OAuth2Client(process.env.CLIENT_ID);

const customPopulate = query => query.populate({
    path: 'creator',
    populate: {
        path: 'userTrips',
        populate: { path: 'tripSteps'}
    }
})
.populate({
    path: 'tripSteps',
    populate: { path: 'trip' }
});

module.exports = {
    trips: async ({ id }, req) => {
        console.log(req.isAuth, req.userId)
        let trips;
        if (!req.isAuth) {
            trips = await customPopulate(Trip.find({ isPublic: true, ...id && { _id: id }}));
        } else {
            trips = await customPopulate(Trip.find({ $or: [{ isPublic: true, ...id && { _id: id } }, { creator: req.userId, ...id && { _id: id } }]}));
        }
        return trips.map(t => ({ ...t._doc }))
    },
    users: async (args, req) => {
        const users = await User.find().populate({
            path: 'userTrips',
            populate: { path: 'tripSteps' }
        });
        return users.map(u => ({ ...u._doc }))
    },
    steps: async ({ trip }, req) => {
        let steps;
        if (!req.isAuth) {
            const trip = await Trip.findOne({ _id: trip, isPublic: true });
            if (!trip) {
                throw new Error('Unauthorize');
            }
            await trip.populate('tripSteps');
            steps = trip.tripSteps
        }
        await steps.populate({
            path: 'trip',
            populate: { path: 'tripSteps' }
        });
        return steps.map(s => ({ ...s._doc }))
    },
    createTrip: async ({ input }, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthorized')
        }
        const trip = new Trip({
            name: input.name,
            ...input.description && { description: input.description },
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            ...input.isPublic && { isPublic: input.isPublic },
            creator: req.userId
        })
        try {
            const res = await trip.save();
            const creator = await User.findById(req.userId).populate()
            creator.userTrips.push(res);
            const updatedCreator = await creator.save();
            return {...res._doc, creator: updatedCreator};
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    logOrSign: async ({ idToken }) => {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID
        });
        const { sub, email, name } = ticket.getPayload();
        let currentUser;
        const existedUser = await User.findOne({ sub });
        if (existedUser) {
            currentUser = existedUser;
        } else {
            const newUser = new User({
                sub,
                email,
                name
            });
            currentUser = await newUser.save();
        }
        return jwt.sign(
            { userId: currentUser.id },
            process.env.SECRET,
            { expiresIn: '1h' })
    },
    addStep: async ({ input }, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthorized')
        }
        const trip = await Trip.findOne({ _id: input.trip, creator: req.userId}).populate();
        if (!trip) {
            throw new Error('Unexistant trip')
        }
        const step = new Step({
            city: input.city,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            trip: input.trip
        })
        try {
            const res = await step.save();
            trip.tripSteps.push(res)
            await trip.save();
            return { ...res._doc, trip }
        } catch (error) {
            throw error
        }
    }
}