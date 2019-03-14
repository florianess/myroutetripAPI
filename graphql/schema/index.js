const { buildSchema } = require('graphql');

module.exports = buildSchema(`
type Step {
    _id: ID!
    city: String!
    startDate: String!
    endDate: String!
    trip: Trip!
}

type Trip {
    _id: ID!
    name: String!
    description: String
    startDate: String!
    endDate: String!
    creator: User!
    isPublic: Boolean!
    tripSteps: [Step]
}

type User {
    _id: ID!
    sub: String!
    email: String!
    name: String!
    userTrips: [Trip]
}

input TripInput {
    name: String!
    description: String
    startDate: String!
    endDate: String!
    isPublic: Boolean
}

input StepInput {
    city: String!
    startDate: String!
    endDate: String!
    trip: String!
}

type RootQuery {
    trips(id: String): [Trip!]!
    users: [User!]!
    steps(trip: String): [Step!]!
    logOrSign(idToken: String): String!
}

type RootMutation {
    createTrip(input: TripInput): Trip
    addStep(input: StepInput): Step
}

schema {
    query: RootQuery
    mutation: RootMutation
}
`)