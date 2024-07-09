import "./App.css";
import React, { useState } from "react";
import { Layout, Menu, Select } from "antd";
import Transactions from "./components/Transactions";
import Stats from "./components/Stats";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

const { Header, Content, Footer } = Layout;

const navItems = [
  {
    key: 1,
    label: <NavLink to="/">Transactions</NavLink>,
  },
  {
    key: 2,
    label: <NavLink to="/stats">Statistics</NavLink>,
  },
];
const options = [
  "Jan - Dec",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const App = () => {
  let [month, setMonth] = useState(3);

  const handleMonthChange = (value) => {
    setMonth(parseInt(value));
  };

  return (
    <BrowserRouter>
      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "green",
          }}
        >
          <NavLink to="/">
            <h1 style={{ color: "white" }}>Roxiler</h1>
          </NavLink>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={["1"]}
            items={navItems}
            style={{
              flex: 1,
              padding: "0 60px",
              backgroundColor: "green",
              fontSize: "16px",
            }}
          />
        </Header>
        <Content
          style={{
            padding: "0px 48px",
            backgroundColor: "white",
            minHeight: 600,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
              marginBottom: "-50px",
            }}
          >
            <div></div>{" "}
            {/* This empty div takes up space to push the Select to the right */}
            <Select
              size="large"
              defaultValue={options[month]}
              onChange={handleMonthChange}
              style={{
                width: 200,
              }}
              options={options.map((text, i) => {
                return {
                  value: i,
                  label: text,
                };
              })}
            />
          </div>
          <Routes>
            <Route
              path="/"
              element={
                <Transactions month={month} monthText={options[month]} />
              }
            />
            <Route
              path="/stats"
              element={<Stats month={month} monthText={options[month]} />}
            />
          </Routes>
        </Content>
        <Footer
          style={{
            textAlign: "center",
            backgroundColor: "#6f9196",
          }}
        >
          Copyright @2024 <strong>Chandresh Sahu</strong>
        </Footer>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
