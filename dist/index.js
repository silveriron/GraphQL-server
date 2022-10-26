import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import fecth from "node-fetch";
const typeDefs = `#graphql
	type User {
		id: ID!
		firstName: String!
    lastName: String!
    fullName: String!
	}

  """
  Tweet is user text message
  """
  type Tweet {
      id: ID!
      text: String!
      userId: ID!
			author: User
  }

  type Movie {
    id: Int
    url: String
    imdb_code: String 
    title: String
    title_english: String
    title_long: String
    slug: String
    year: Int
    rating: Float
    runtime: Int 
    genres:[String]
    summary: String
    description_full: String
    synopsis: String
    yt_trailer_code: String
    language: String
    mpa_rating: String
    background_image: String
    background_image_original: String
    small_cover_image: String
    medium_cover_image: String
    large_cover_image: String
    state: String
  }	

  type Query {
    allMovies: [Movie!]!
    """
    get all users
    """
    allUsers:[User!]!
    allTweets:[Tweet!]!
		Tweet(id:ID!): Tweet
    Movie(id: Int!): Movie
  }

	type Mutation {
		postTweet(text: String!, userId: ID!): Boolean!
		deleteTweet(id: ID!): Boolean!
	}
`;
let tweets = [
    {
        id: 1,
        text: "test one",
        userId: 1,
    },
    {
        id: 2,
        text: "test two",
        userId: 2,
    },
];
const users = [
    {
        id: 1,
        firstName: "Peter",
        lastName: "Parker",
    },
    {
        id: 2,
        firstName: "James",
        lastName: "Moris",
    },
];
const resolvers = {
    Query: {
        allMovies: async () => {
            const res = await fecth("https://yts.mx/api/v2/list_movies.json");
            const data = await res.json();
            return data.data.movies;
        },
        allUsers: () => {
            return users;
        },
        allTweets: () => {
            return tweets;
        },
        Tweet: (_, { id }) => {
            return tweets.find((t) => t.id === +id);
        },
        Movie: async (_, { id }) => {
            const res = await fecth(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`);
            const data = await res.json();
            return data.data.movie;
        },
    },
    Mutation: {
        postTweet: (_, { text, userId }) => {
            if (!users.find((user) => user.id === +userId)) {
                console.log("Invalid userId");
                return tweets;
            }
            tweets.push({ id: tweets.length + 1, text, userId: +userId });
            return tweets;
        },
        deleteTweet: (_, { id }) => {
            let bool = false;
            tweets = tweets.filter((t) => {
                if (t.id === id) {
                    bool = true;
                }
                return t.id !== id;
            });
            return bool;
        },
    },
    User: {
        fullName: ({ firstName, lastName }) => {
            return `${firstName} ${lastName}`;
        },
    },
    Tweet: {
        author: ({ id }) => {
            return users.find((user) => user.id === +id);
        },
    },
};
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
console.log(`🚀  Server ready at: ${url}`);
