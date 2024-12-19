import React, { useEffect, useState } from "react";
import {
  getTradeBySellerAPI,
  gettradeDayInMonthAPI,
  getTradeInYearAPI,
} from "../../../../api/tradeAPI";
import {
  getProductByClassifyAPI,
  getProductById,
} from "../../../../api/productAPI";
import { useSelector } from "react-redux";
import CachedIcon from "@mui/icons-material/Cached";
import CountUp from "react-countup";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Filler } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import { getCheckCartAPI } from "../../../../api/cartAPI";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [loading, setLoading] = useState(false);
  const [monthlyTradeData, setMonthlyTradeData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Set default year to current year
  const [yearsList, setYearsList] = useState([]); // Store available years for selection

  const [groupedData, setGroupedData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const [topProductsData, setTopProductsData] = useState({});

  const [bottomProductsData, setBottomProductsData] = useState({});

  const [chartCateData, setChartCateData] = useState({
    labels: [],
    datasets: [
      {
        label: "Total Products by Category",
        data: [],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  });

  useEffect(() => {
    const fetchOrdersWithDetails = async () => {
      setLoading(true);
      try {
        const fetchedOrders = await getTradeBySellerAPI(
          user._id,
          user.access_token
        );
        if (fetchedOrders.status === 200) {
          const detailedOrders = await Promise.all(
            fetchedOrders?.data
              ?.filter(
                (order) =>
                  (order.paymentMethod === "zalo" && order.payment === true) ||
                  order.paymentMethod === "cash"
              )
              ?.map(async (order) => {
                const productResponse = await getProductById(
                  order.products[0].productId
                );
                if (productResponse.status === 200) {
                  const productData = productResponse.data[0];
                  return {
                    ...order,
                    productName: productData.productName,
                    image: productData.images?.[0] || "",
                    brand: productData.brand,
                    category: productData.category,
                    numberProduct: order.products[0].numberProduct,
                    phoneContact: user.number,
                    status: order.isCancel
                      ? "Cancel"
                      : order.sellerAccept
                      ? "Approval"
                      : "Pending",
                    statusColor: order.isCancel
                      ? "text-red-500"
                      : order.sellerAccept
                      ? "text-green-500"
                      : "text-yellow-500",
                    paymentMethod:
                      order.paymentMethod == "cash"
                        ? "Thanh toán khi nhận hàng"
                        : "ZaloPay",
                  };
                }
                return order;
              })
          );

          setOrders(detailedOrders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrdersWithDetails();
  }, [user._id, user.access_token]);

  useEffect(() => {
    const fetchTradeInYear = async () => {
      try {
        const response = await getTradeInYearAPI(user._id);
        if (response.status === 201) {
          const sortedData = response.data.sort((a, b) => a.month - b.month);
          setMonthlyTradeData(sortedData);
          const uniqueYears = [
            ...new Set(response.data.map((data) => data.year)),
          ];

          if (!uniqueYears.includes(2024)) {
            uniqueYears.push(2024);
          }

          setYearsList(uniqueYears.sort((a, b) => a - b));
          setSelectedYear(2024);
        }
      } catch (error) {
        console.error("Error fetching trade data for the year:", error);
      }
    };
    fetchTradeInYear();
  }, [user._id]);

  useEffect(() => {
    const fetchTradeInMonth = async () => {
      try {
        setLoading(true);
        const response = await gettradeDayInMonthAPI(
          user._id,
          selectedMonth,
          selectedYear,
          user.access_token
        );
        if (response.status === 201) {
          const grouped = groupTradeDataByClassifyId(response.data);
          // console.log("grouped", grouped);

          const groupedWithProductId = await groupDataWithProductId(grouped);
          setGroupedData(groupedWithProductId);
          // console.log("groupedWithProductId", groupedWithProductId);

          const topProds = getTop3Products(groupedWithProductId);
          setTopProducts(topProds);
        }
      } catch (error) {
        console.error("Error fetching trade data for the month:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTradeInMonth();
  }, [selectedMonth, selectedYear, user._id, user.access_token]);

  const groupTradeDataByClassifyId = (data) => {
    // Gộp dữ liệu theo classifyId
    const groupedData = data.reduce((acc, item) => {
      const classifyKey = item.sellerDetails?.classifyId;

      if (!acc[classifyKey]) {
        acc[classifyKey] = {
          totalBalance: 0,
          totalProducts: 0,
        };
      }

      acc[classifyKey].totalBalance += item.sellerDetails?.totalBalance;
      acc[classifyKey].totalProducts += item.sellerDetails?.totalProducts;

      return acc;
    }, {});

    // Chuyển đổi từ object sang mảng (nếu cần)
    return Object.entries(groupedData).map(([classifyId, stats]) => ({
      classifyId,
      ...stats,
    }));
  };

  const groupDataWithProductId = async (groupedData) => {
    // Gọi API getProductByClassifyAPI và gộp dữ liệu
    const updatedData = await Promise.all(
      groupedData.map(async (item) => {
        try {
          const productResponse = await getProductByClassifyAPI(
            item.classifyId
          );
          // console.log("productResponse", productResponse.data[0]);
          const productName =
            productResponse?.data[0]?.p?.productName || "Unknown Product";
          const productId =
            productResponse?.data[0]?.p?._id || "Unknown Product";

          // Gộp lại các sản phẩm có cùng productId
          return {
            ...item,
            productId,
            productName,
          };
        } catch (error) {
          console.error(
            `Error fetching product for classifyId ${item.classifyId}:`,
            error
          );
          return {
            ...item,
            productId: "Unknown Product", // ID mặc định nếu có lỗi
            productName: "Unknown Product", // Sản phẩm mặc định nếu có lỗi
          };
        }
      })
    );

    // Sau khi đã lấy thông tin productId cho mỗi classifyId, ta sẽ gộp lại theo productId
    const groupedByProductId = updatedData.reduce((acc, item) => {
      if (!acc[item.productId]) {
        acc[item.productId] = {
          productName: item.productName,
          totalBalance: 0,
          totalProducts: 0,
        };
      }

      acc[item.productId].totalBalance += item.totalBalance;
      acc[item.productId].totalProducts += item.totalProducts;

      return acc;
    }, {});

    // Chuyển đổi từ object sang mảng (nếu cần)
    const result = Object.entries(groupedByProductId).map(
      ([productId, stats]) => ({
        productId,
        productName: stats.productName,
        totalBalance: stats.totalBalance,
        totalProducts: stats.totalProducts,
      })
    );

    return result;
  };

  // Filter the data based on the selected year
  const filteredTradeData = monthlyTradeData.filter(
    (data) => data.year === selectedYear
  );

  // Calculate total revenue for the selected year
  const totalRevenue = filteredTradeData?.reduce(
    (total, data) => total + data.totalBalance,
    0
  );

  const getTop3Products = (data) => {
    return data
      .sort((a, b) => b.totalProducts - a.totalProducts) // Sắp xếp theo số lượng sản phẩm bán ra
      .slice(0, 3); // Chỉ lấy 3 sản phẩm top đầu
  };

  // Count orders by status
  const orderCounts = orders.reduce(
    (counts, order) => {
      if (order.status === "Pending") counts.pending += 1;
      if (order.status === "Cancel") counts.canceled += 1;
      if (order.status === "Approval") counts.approved += 1;
      return counts;
    },
    { pending: 0, canceled: 0, approved: 0 }
  );

  // Dữ liệu cho biểu đồ Line
  useEffect(() => {
    // Fetch the data
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getCheckCartAPI();
        const data = response.data;

        // Process data for the chart
        const groupedData = data.reduce((acc, item) => {
          if (!acc[item.categoriesName]) {
            acc[item.categoriesName] = 0;
          }
          acc[item.categoriesName] += item.totalNumberProducts;
          return acc;
        }, {});

        const labels = Object.keys(groupedData); // x-axis labels
        const values = Object.values(groupedData); // y-axis values

        // Sắp xếp dữ liệu theo totalNumberProducts để lấy top và bottom 20 sản phẩm
        const sortedData = [...data].sort(
          (a, b) => b.totalNumberProducts - a.totalNumberProducts
        );

        const top10Products = sortedData.slice(0, 10);
        const bottom10Products = sortedData.slice(-10);

        // Lọc top 10 sản phẩm có totalNumberProducts lớn nhất
        const topLabels = top10Products.map((item) => item.productName);
        const topValues = top10Products.map((item) => item.totalNumberProducts);

        // Lọc bottom 10 sản phẩm có totalNumberProducts thấp nhất
        const bottomLabels = bottom10Products.map((item) => item.productName);
        const bottomValues = bottom10Products.map(
          (item) => item.totalNumberProducts
        );

        setChartCateData({
          labels,
          datasets: [
            {
              label: "Total Products by Category",
              data: values,
              borderColor: "rgba(75,192,192,1)",
              backgroundColor: labels.map(
                (_, index) =>
                  `rgba(${(index * 100) % 255}, ${(index * 70) % 255}, ${
                    (index * 50) % 255
                  }, 0.6)`
              ), // Dynamically set backgroundColor
              fill: true,
              tension: 0.4,
            },
          ],
        });

        setTopProductsData({
          labels: topLabels,
          datasets: [
            {
              label: "Top 10 Products by Total Number",
              data: topValues,
              backgroundColor: topLabels.map(
                (_, index) =>
                  `rgba(${(index * 100) % 255}, ${(index * 70) % 255}, ${
                    (index * 50) % 255
                  }, 0.6)`
              ),
              borderColor: "rgba(75,192,192,1)",
              borderWidth: 1,
            },
          ],
        });

        setBottomProductsData({
          labels: bottomLabels,
          datasets: [
            {
              label: "Bottom 10 Products by Total Number",
              data: bottomValues,
              backgroundColor: bottomLabels.map(
                (_, index) =>
                  `rgba(${(index * 100) % 255}, ${(index * 50) % 255}, ${
                    (index * 80) % 255
                  }, 0.6)`
              ),
              borderColor: "rgba(75,192,192,1)",
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: filteredTradeData?.map((data) => `Month ${data.month}`),
    datasets: [
      {
        label: "Total Balance",
        data: filteredTradeData?.map((data) => data.totalBalance),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Total Balance (VND)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Month",
        },
      },
    },
  };

  // Dữ liệu cho chart Doughnut (biểu đồ vòng)
  const doughnutDataSold = {
    labels: groupedData.map((item) => `${item.productName}`),
    datasets: [
      {
        label: "Tổng số lượng bán được trong tháng",
        data: groupedData?.map((item) => item.totalProducts),
        backgroundColor: groupedData?.map(
          (_, index) =>
            `rgba(${(index * 30) % 255}, ${(index * 50) % 255}, ${
              (index * 70) % 255
            }, 0.6)`
        ),
      },
    ],
  };

  const doughnutDataRevenue = {
    labels: groupedData?.map((item) => `${item.productName}`),
    datasets: [
      {
        label: "Tổng doanh thu của sản phẩm trong tháng",
        data: groupedData?.map((item) => item.totalBalance),
        backgroundColor: groupedData?.map(
          (_, index) =>
            `rgba(${(index * 100) % 255}, ${(index * 100) % 255}, 0, 0.6)`
        ),
      },
    ],
  };

  return (
    <div className="flex-1 p-6 bg-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Tháng và Năm Selector */}
        <div className="flex items-center space-x-4">
          <div>
            <label className="mr-2">Chọn Năm:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="p-2 bg-white border rounded-xl"
            >
              {yearsList.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mr-2">Chọn Tháng:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="p-2 bg-white border rounded-xl"
            >
              {[...Array(12).keys()].map((month) => (
                <option key={month + 1} value={month + 1}>
                  {month + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Order Summary */}
      <h2 className="pb-2 text-2xl font-medium">
        Thống Kê Trong Năm {selectedYear}
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 border-2 bg-white border-yellow-500 text-yellow-500 text-center rounded-lg transform transition-all hover:scale-105">
          <h3 className="font-medium">Đơn hàng đang chờ</h3>
          <CountUp end={orderCounts.pending} duration={2} />
        </div>
        <div className="p-4 border-2 bg-white border-red-500 text-red-500 text-center rounded-lg transform transition-all hover:scale-105">
          <h3 className="font-medium">Đơn hàng đã huỷ</h3>
          <CountUp end={orderCounts.canceled} duration={2} />
        </div>
        <div className="p-4 border-2 bg-white border-green-500 text-green-500 text-center rounded-lg transform transition-all hover:scale-105">
          <h3 className="font-medium">Đơn hàng đã chấp nhận</h3>
          <CountUp end={orderCounts.approved} duration={2} />
        </div>
      </div>

      {/* Monthly Trade Data */}
      <div className="flex space-x-4">
        <div className="w-2/3 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">
            Bảng thống kê doanh thu hàng tháng trong năm {selectedYear}
          </h2>
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="w-1/3 bg-white p-4 rounded-lg shadow-md flex items-center justify-center">
          <div>
            <h2 className="text-xl font-bold mb-2 text-center">
              Tổng Doanh Thu Năm {selectedYear}
            </h2>
            <p className="text-3xl font-semibold text-center text-green-600">
              <CountUp end={totalRevenue} duration={2} /> VND
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Best-Selling Products */}
      <div className="mt-8">
        <h2 className="text-2xl font-medium mb-4">
          Sản Phẩm Bán Chạy Top Đầu Tháng {selectedMonth}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {topProducts && topProducts.length > 0 ? (
            topProducts?.map((product, index) => (
              <div
                key={product.classifyId}
                className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md transform transition-all hover:scale-105"
              >
                <h3
                  className={`text-2xl font-semibold ${
                    index === 0
                      ? "text-yellow-500"
                      : index === 1
                      ? "text-blue-500"
                      : index === 2
                      ? "text-green-500"
                      : "text-gray-800"
                  }`}
                >
                  {`Hạng ${index + 1}`}
                </h3>
                <p className="text-lg mt-2 line-clamp-2">
                  {product.productName}
                </p>
                <p className="text-xl font-medium mt-2">
                  <CountUp end={product.totalProducts} duration={2} /> sản phẩm
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-600">
              Tháng này không có sản phẩm nào được bán.
            </div>
          )}
        </div>
      </div>

      {/* Doughnut Charts */}
      <h2 className="pt-8 pb-4 text-2xl font-medium">
        Thống Kê Theo Tháng {selectedMonth}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Chart 1: Total Products Sold */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">
            Số Lượng Sản Phẩm Bán Được Trong Tháng
          </h2>
          {groupedData.length === 0 ? (
            <p className="text-center text-gray-600">
              Không có sản phẩm bán trong tháng này.
            </p>
          ) : (
            <Doughnut data={doughnutDataSold} options={{ responsive: true }} />
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">
            Tổng Doanh Thu Của Sản Phẩm Trong Tháng
          </h2>
          {groupedData.length === 0 ? (
            <p className="text-center text-gray-600">
              Không có doanh thu trong tháng này.
            </p>
          ) : (
            <Doughnut
              data={doughnutDataRevenue}
              options={{ responsive: true }}
            />
          )}
        </div>
      </div>

      <div className="text-center p-4 mt-8">
        <h1 className="text-3xl font-bold">Dữ Liệu Toàn Hệ Thống</h1>
      </div>

      {/* Cate Chart */}
      <div className=" bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">
          Số Lượng Sản Phẩm Theo Danh Mục
        </h2>
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : (
          chartCateData.labels.length > 0 && (
            <Bar
              data={chartCateData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" }, // Hiển thị chú thích
                  title: {
                    display: true,
                    text: "Số Lượng Sản Phẩm Theo Danh Mục", // Đổi tiêu đề biểu đồ
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Danh Mục Sản Phẩm", // Tiêu đề trục X
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Số Lượng Sản Phẩm", // Tiêu đề trục Y
                    },
                    beginAtZero: true, // Bắt đầu từ 0
                  },
                },
              }}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
