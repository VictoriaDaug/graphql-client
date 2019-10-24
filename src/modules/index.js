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
    }
  }
`;

const Home = () => {
  useScrollToTop();
  //TODO: Replace these with useQuery hook you wrote

    const {data, errors, fetching} = useQuery({
      query: THREADS_QUERY,
      variables: {
        sortBy: 'LATEST', limit: 2
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
