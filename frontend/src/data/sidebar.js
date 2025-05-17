import {
  FaTh,
  FaRegChartBar,
  FaCommentAlt,
  FaMoneyBillWave,
  FaUserCog,
  FaTags,
} from "react-icons/fa";
import { BiImageAdd } from "react-icons/bi";

const menuItems = [
  {
    title: "Dashboard",
    icon: <FaTh />,
    path: "/dashboard",
  },
  {
    title: "Add Product",
    icon: <BiImageAdd />,
    path: "/add-product",
  },
  {
    title: "Transactions",
    icon: <FaMoneyBillWave />,
    path: "/transactions",
  },
  {
    title: "Admin",
    icon: <FaUserCog />,
    childrens: [
      {
        title: "User Management",
        path: "/admin/users",
      },
      {
        title: "Category Management",
        path: "/admin/categories",
      },
    ],
    adminOnly: true,
  },
  {
    title: "Report Bug",
    icon: <FaCommentAlt />,
    path: "/contact-us",
  },
];

export default menuItems;
