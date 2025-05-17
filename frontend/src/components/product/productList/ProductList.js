import React, { useEffect, useState } from "react";
import { SpinnerImg } from "../../loader/Loader";
import "./productList.scss";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import Search from "../../search/Search";
import { useDispatch, useSelector } from "react-redux";
import {
  FILTER_PRODUCTS,
  selectFilteredPoducts,
} from "../../../redux/features/product/filterSlice";
import ReactPaginate from "react-paginate";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import {
  deleteProduct,
  getProducts,
} from "../../../redux/features/product/productSlice";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const ProductList = ({ products, isLoading, handleDelete }) => {
  const [search, setSearch] = useState("");
  const filteredProducts = useSelector(selectFilteredPoducts);
  const dispatch = useDispatch();

  const shortenText = (text, n) => {
    if (text.length > n) {
      const shortenedText = text.substring(0, n).concat("...");
      return shortenedText;
    }
    return text;
  };

  const delProduct = async (id) => {
    await dispatch(deleteProduct(id));
    await dispatch(getProducts());
  };

  const confirmDelete = (id) => {
    confirmAlert({
      title: "Delete Product",
      message: "Are you sure you want to delete this product?",
      buttons: [
        {
          label: "Delete",
          onClick: () => delProduct(id),
        },
        {
          label: "Cancel",
        },
      ],
    });
  };

  //   Begin Pagination
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(filteredProducts.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(filteredProducts.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, filteredProducts]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % filteredProducts.length;
    setItemOffset(newOffset);
  };
  //   End Pagination

  useEffect(() => {
    dispatch(FILTER_PRODUCTS({ products, search }));
  }, [products, search, dispatch]);

  const getExpiryStatus = (expiryDate) => {
    // Return early if no expiry date
    if (!expiryDate) {
      return { status: "No expiry date", className: "no-expiry" };
    }

    try {
      const today = new Date();
      const expiry = new Date(expiryDate);

      // Check if expiry is a valid date
      if (isNaN(expiry.getTime())) {
        return { status: "Invalid date", className: "no-expiry" };
      }

      const daysUntilExpiry = Math.ceil(
        (expiry - today) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry < 0) {
        return { status: "Expired", className: "expired" };
      } else if (daysUntilExpiry <= 30) {
        return {
          status: `Expires in ${daysUntilExpiry} days`,
          className: "expiring-soon",
        };
      } else {
        try {
          const timeUntil = formatDistanceToNow(expiry, { addSuffix: true });
          return { status: `Expires ${timeUntil}`, className: "valid" };
        } catch (error) {
          return { status: "Invalid date", className: "no-expiry" };
        }
      }
    } catch (error) {
      return { status: "Error processing date", className: "no-expiry" };
    }
  };

  return (
    <div className="product-list">
      <div className="table">
        <div className="--flex-between --flex-dir-column">
          <h3>Inventory Items</h3>
          <div className="search">
            <Search
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
            />
          </div>
        </div>

        {isLoading && <SpinnerImg />}

        <div className="table">
          {!isLoading && products.length === 0 ? (
            <p className="--text-center --py2">
              No products found. Please add a product.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Value</th>
                  <th>Expiry Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((product, index) => {
                  const { _id, name, category, price, quantity, expiryDate } =
                    product;
                  const expiryStatus = getExpiryStatus(expiryDate);
                  return (
                    <tr key={_id}>
                      <td>{itemOffset + index + 1}</td>
                      <td>{shortenText(name, 16)}</td>
                      <td>{category?.name || "N/A"}</td>
                      <td>
                        {"Rs. "}
                        {price}
                      </td>
                      <td>{quantity}</td>
                      <td>
                        {"Rs. "}
                        {price * quantity}
                      </td>
                      <td className={`expiry-date ${expiryStatus.className}`}>
                        {expiryStatus.status}
                      </td>
                      <td>
                        <div className="actions">
                          <button className="view">
                            <Link to={`/product-detail/${_id}`}>
                              <FiEye size={20} />
                            </Link>
                          </button>
                          <button className="edit">
                            <Link to={`/edit-product/${_id}`}>
                              <FiEdit2 size={20} />
                            </Link>
                          </button>
                          <button
                            className="delete"
                            onClick={() => confirmDelete(_id)}
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <ReactPaginate
          breakLabel="..."
          nextLabel="Next"
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          pageCount={pageCount}
          previousLabel="Prev"
          renderOnZeroPageCount={null}
          containerClassName="pagination"
          pageLinkClassName="page-num"
          previousLinkClassName="page-num"
          nextLinkClassName="page-num"
          activeLinkClassName="activePage"
        />
      </div>
    </div>
  );
};

export default ProductList;
