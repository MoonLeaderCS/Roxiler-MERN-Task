import React, { useEffect, useState } from "react";
import { Table, Input, message, Image } from "antd";
import axios from "axios";
// import moment from "moment";

const { Search } = Input;
const columns = [
  {
    title: "ID",
    dataIndex: "id",
    width: "40px",
  },
  {
    title: "Title",
    dataIndex: "title",
    width: "200px",
  },
  {
    title: "Description",
    dataIndex: "description",
  },
  {
    title: "Price",
    dataIndex: "price",
    render: (price) => parseFloat(price).toFixed(2),
    width: "80px",
  },
  {
    title: "Category",
    dataIndex: "category",
    width: "120px",
  },
  {
    title: "Sold",
    dataIndex: "sold",
    render: (sold) => (sold ? "Yes" : "No"),
    width: "50px",
  },
  {
    title: "Image",
    dataIndex: "image",
    render: (url) => <Image src={url} alt="Product Image" />,
    width: "80px",
  },
  // {
  //     title: "Date",
  //     dataIndex: "dateOfSale",
  //     render: (date) => moment(date).format("DD MMM YYYY"),
  //     width: "100px"
  // },
];

function Transactions({ month, monthText }) {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const getData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `https://roxiler-pvpf.onrender.com/transactions`,
        {
          params: {
            month,
            page: tableParams.pagination.current,
            limit: tableParams.pagination.pageSize,
            search: tableParams.search,
          },
        }
      );

      setData(data.transactions);
      setLoading(false);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: data.totalCount,
        },
      });
      // message.success("Data loaded successfully");
    } catch (error) {
      console.log(error);
      message.error("Error loading data");
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      ...tableParams,
      pagination,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const handleSearch = (value) => {
    setTableParams({
      ...tableParams,
      search: value,
    });
  };

  useEffect(() => {
    getData();
  }, [JSON.stringify(tableParams), month]);

  return (
    <>
      <Search
        placeholder="Search"
        allowClear
        onSearch={handleSearch}
        style={{
          width: 300,
          padding: "12px 0px",
        }}
      />

      <Table
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={data}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
        size="small"
        bordered
        title={() => <strong>Month: {monthText}</strong>}
        scroll={{ y: 540 }}
      />
    </>
  );
}

export default Transactions;
