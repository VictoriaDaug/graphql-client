import React from "react";
import styled from "styled-components";
import Header from "./layout/Header";
import Home from "./modules";
import {
  Client
} from './gql/Client';
import {
  Context
} from './contexts/contextCreator';

const Wrapper = styled.div`
  min-height: 100%;
  padding: 8px 16px;
  background-color: #f6f6ef;
`;

 const client = new Client('https://threed-test-api.herokuapp.com/graphql');

const App = () => (
  <Context.Provider value={client}>
    <>
      <Header />
      <Wrapper>
        <Home />
      </Wrapper>
    </>
  </Context.Provider>
);

export default App;
