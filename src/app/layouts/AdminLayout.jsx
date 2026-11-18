import { Outlet, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';
import '../../features/admin/admin.css';

/**
 * AdminLayout
 * Layout chính cho khu vực quản trị viên (Admin).
 * Hỗ trợ cả cơ chế lồng route của react-router-dom (Outlet) và cơ chế bọc component con (children).
 */
export default function AdminLayout({ children }) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <div className="admin-layout">
      {/* Sidebar điều hướng cố định bên trái */}
      <AdminSidebar />

      {/* Vùng nội dung chính bên phải */}
      <div className="admin-main">
        {/* Header trên cùng */}
        <AdminHeader />

        {/* Nội dung trang hiển thị ở giữa với framer-motion transition */}
        <motion.main
          key={location.pathname}
          className="admin-content"
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
        >
          {children || <Outlet />}
        </motion.main>

        {/* Footer dưới cùng */}
        <AdminFooter />
      </div>
    </div>
  );
}

