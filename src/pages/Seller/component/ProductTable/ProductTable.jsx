import React, { useEffect, useState } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CachedIcon from "@mui/icons-material/Cached";
import { getProductsBySellerId } from "../../../../api/productAPI";
import { useSelector } from "react-redux";
import Loading from "../../../../components/Loading/Loading";

const ProductTable = ({ setActiveTab, setProductEdit }) => {
  const [columns, setColumns] = useState([
    { name: "ProductID", visible: true },
    { name: "Name", visible: true },
    { name: "Danh mục", visible: true },
    { name: "Thương hiệu", visible: true },
    { name: "Ảnh", visible: true },
    { name: "Ngày tạo", visible: true },
    { name: "Đã bán", visible: false },
  ]);

  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    column: "",
    direction: "asc",
  });

  const toggleColumnVisibility = (name) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.name === name ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleNewProduct = () => {
    setActiveTab("add-product");
  };

  const handleEditProduct = (product) => {
    setProductEdit(product);
    setActiveTab("update-product");
  };

  useEffect(() => {
    setLoading(true);
    try {
      const fetchProductsofSeller = async () => {
        const response = await getProductsBySellerId(user._id, page);
        setProducts(response.data);
        setSortedProducts(response.data);
        setTotalPages(Math.ceil(response.data.length / 10));
      };
      fetchProductsofSeller();
    } catch (error) {
      console.log("Error fetching products: ", error);
    } finally {
      setLoading(false);
    }
  }, [page, user._id]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const handleSort = (column) => {
    let direction = "asc";
    if (sortConfig.column === column && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ column, direction });

    const sortedArray = [...products].sort((a, b) => {
      const colA = getValueByColumnName(a, column);
      const colB = getValueByColumnName(b, column);
      if (colA < colB) return direction === "asc" ? -1 : 1;
      if (colA > colB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setSortedProducts(sortedArray);
  };

  const getValueByColumnName = (product, column) => {
    switch (column) {
      case "Name":
        return product.productName;
      case "Danh mục":
        return product.categories[0]?.categoriesName || "";
      case "Thương hiệu":
        return product.brand;
      case "Ngày tạo":
        return new Date(product.dateUp).getTime();
      case "Đã bán":
        return product.selled || 0;
      default:
        return "";
    }
  };

  const getSortIcon = (column) => {
    if (sortConfig.column === column) {
      return sortConfig.direction === "asc" ? "▲" : "▼";
    }
    return "⇅";
  };

  const handleReload = () => {
    setSortedProducts(products);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex-1">
      {loading && <Loading />}
      <div className="flex justify-between">
        <h1 className="text-xl font-bold mb-4">Quản lý Sản Phẩm</h1>
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={handleNewProduct}
        >
          Sản Phẩm Mới
        </button>
      </div>

      {/* Toggle columns */}
      <div className="mb-4">
        <h2 className="font-bold mb-2">Tuỳ Chỉnh Cột</h2>
        {columns.map((col) => (
          <label key={col.name} className="mr-10">
            <input
              type="checkbox"
              checked={col.visible}
              onChange={() => toggleColumnVisibility(col.name)}
            />
            <span className="ml-2">{col.name}</span>
          </label>
        ))}
        <button onClick={handleReload} className="bg-gray-300 rounded p-1 ml-4">
          <CachedIcon />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
          <thead>
            <tr className="border-b">
              {/* <th className="py-2"></th> */}
              {columns.map(
                (col) =>
                  col.visible && (
                    <th
                      key={col.name}
                      onClick={() => handleSort(col.name)}
                      className="bg-gray-100 text-left p-4 cursor-pointer border-b"
                    >
                      {col.name} {getSortIcon(col.name)}
                    </th>
                  )
              )}
              <th className="bg-gray-100 text-left p-4 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts?.map((product) => (
              <tr key={product._id} className="border-b">
                {/* <td className="py-2 px-4">
                  <input type="checkbox" />
                </td> */}
                {columns.map(
                  (col) =>
                    col.visible && (
                      <td key={col.name} className="py-2 px-4 text-sm">
                        {col.name === "ProductID" && product._id.slice(-6)}
                        {col.name === "Name" && product.productName}
                        {col.name === "Danh mục" &&
                          product.categories[0]?.categoriesName}
                        {col.name === "Thương hiệu" && product.brand}
                        {col.name === "Ảnh" && (
                          <img
                            src={product.images[0]}
                            alt={product.productName}
                            className="w-16 h-16 object-cover"
                          />
                        )}
                        {col.name === "Ngày tạo" &&
                          new Date(product.dateUp).toLocaleDateString()}
                        {col.name === "Đã bán" && product?.selled}
                      </td>
                    )
                )}
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="bg-blue-500 text-white p-1 rounded"
                  >
                    <EditOutlinedIcon />
                  </button>
                  {/* <button className="bg-red-500 text-white p-1 rounded ml-2">
                    <DeleteOutlineOutlinedIcon />
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-end">
        <button
          className="bg-gray-300 p-2 rounded mr-2"
          onClick={handlePreviousPage}
          disabled={page === 1}
        >
          Trước Đó
        </button>
        <span className="p-2">{page}</span>
        <button
          className="bg-gray-300 p-2 rounded ml-2"
          onClick={handleNextPage}
          disabled={page === totalPages}
        >
          Tiếp Theo
        </button>
      </div>
    </div>
  );
};

export default ProductTable;
