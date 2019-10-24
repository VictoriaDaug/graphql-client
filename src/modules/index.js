import React from "react";
import gql from "graphql-tag";
import Thread from "./Thread";
import { useScrollToTop } from "../common/useScrollToTop";
import { useQuery } from '../hooks/useQuery'

const THREADS_QUERY = gql`
  query($sortBy: SortBy!, $skip: Int, $limit: Int) {
    threads(sortBy: $sortBy, limit: $limit, skip: $skip) {
      id
      text
      title
      createdBy {
        id
        username
      }
      createdAt
      hasUserLiked
      likesNumber
      repliesNumber
      replies(skip: $skip, limit: $limit) {
        text
        createdAt
      }
    }
  }
`;

const Home = () => {
  useScrollToTop();

    const {data, errors, fetching} = useQuery({
      query: THREADS_QUERY,
      variables: {
        sortBy: 'OLDEST', limit: 10
      }
    })

  if (fetching) return <p>Loading...</p>;
  if (errors) return <p>Error! {errors[0].message}</p>

  return (
    <div>
      {data && data.threads.map(thread => (
        <Thread key={thread.id} {...thread} />
      ))}
    </div>
  );
};

export default Home;
