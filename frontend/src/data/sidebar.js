import {
  FaTh,
  FaRegChartBar,
  FaCommentAlt,
  FaMoneyBillWave,
  FaUserCog,
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
    title: "Account",
    icon: <FaRegChartBar />,
    childrens: [
      {
        title: "Profile",
        path: "/profile",
      },
      {
        title: "Edit Profile",
        path: "/edit-profile",
      },
    ],
  },
  {
    title: "Admin",
    icon: <FaUserCog />,
    childrens: [
      {
        title: "User Management",
        path: "/admin/users",
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
