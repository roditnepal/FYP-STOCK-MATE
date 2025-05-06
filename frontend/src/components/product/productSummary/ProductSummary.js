import React, { useEffect } from "react";
import "./ProductSummary.scss";
import { AiFillDollarCircle } from "react-icons/ai";
import { BsCart4, BsCartX } from "react-icons/bs";
import { BiCategory } from "react-icons/bi";
import { FiBox } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  CALC_CATEGORY,
  CALC_OUTOFSTOCK,
  CALC_STORE_VALUE,
  selectCategory,
  selectOutOfStock,
  selectTotalStoreValue,
} from "../../../redux/features/product/productSlice";

// Format Amount
export const formatNumbers = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const ProductSummary = ({ products }) => {
  const dispatch = useDispatch();
  const totalStoreValue = useSelector(selectTotalStoreValue);
  const outOfStock = useSelector(selectOutOfStock);
  const category = useSelector(selectCategory);

  useEffect(() => {
    dispatch(CALC_STORE_VALUE(products));
    dispatch(CALC_OUTOFSTOCK(products));
    dispatch(CALC_CATEGORY(products));
  }, [dispatch, products]);

  return (
    <div className="product-summary">
      <div className="header">
        <h3>
          <FiBox size={24} />
          Inventory Overview
        </h3>
      </div>
      <div className="info-summary">
        <div className="info-box card1">
          <div className="info-icon">
            <BsCart4 size={32} />
          </div>
          <div className="info-text">
            <h4>Total Products</h4>
            <h3>{formatNumbers(products.length)}</h3>
          </div>
        </div>

        <div className="info-box card2">
          <div className="info-icon">
            <AiFillDollarCircle size={32} />
          </div>
          <div className="info-text">
            <h4>Total Store Value</h4>
            <h3>Rs. {formatNumbers(totalStoreValue.toFixed(2))}</h3>
          </div>
        </div>

        <div className="info-box card3">
          <div className="info-icon">
            <BsCartX size={32} />
          </div>
          <div className="info-text">
            <h4>Out of Stock</h4>
            <h3>{formatNumbers(outOfStock)}</h3>
          </div>
        </div>

        <div className="info-box card4">
          <div className="info-icon">
            <BiCategory size={32} />
          </div>
          <div className="info-text">
            <h4>All Categories</h4>
            <h3>{formatNumbers(category.length)}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSummary;
