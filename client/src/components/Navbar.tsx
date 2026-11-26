import { Link, NavLink } from 'react-router-dom';
import { selectCartCount } from '../store/bookingSlice';
import { useAppSelector } from '../store/hooks';

const NAV_ITEMS = [
  { to: '/booking', label: 'Đặt sân' },
  { to: '/history', label: 'Lịch sử đặt sân' },
  { to: '/stats', label: 'Thống kê' },
];

function linkClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? 'navbar__link navbar__link--active' : 'navbar__link';
}

export default function Navbar() {
  const cartCount = useAppSelector(selectCartCount);

  return (
    <header className="navbar">
      <Link to="/booking" className="navbar__brand">
        Đặt sân thể thao
      </Link>

      <nav className="navbar__links" aria-label="Điều hướng chính">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClassName}>
            {item.label}
          </NavLink>
        ))}

        <NavLink to="/checkout" className={linkClassName}>
          Giỏ đặt sân
          {cartCount > 0 && (
            <span className="navbar__badge" aria-label={`${cartCount} khung giờ trong giỏ`}>
              {cartCount}
            </span>
          )}
        </NavLink>
      </nav>

    </header>
  );
}
