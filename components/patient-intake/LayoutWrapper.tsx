import { ComponentChildren } from 'preact'

interface LayoutWrapperProps {
  children: ComponentChildren
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <>
      <style>
        {`
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          .layout-container {
            min-height: 100vh;
            background: #f9fafb;
            display: flex;
          }
          
          .sidebar {
            width: 280px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
          }
          
          .sidebar-content {
            padding: 2rem 0;
          }
          
          .logo {
            padding: 0 2rem 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          
          .logo-icon {
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
          }
          
          .logo-text {
            font-size: 0.875rem;
            font-weight: 600;
            line-height: 1.2;
          }
          
          .nav-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 2rem;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: all 0.2s;
            border-left: 3px solid transparent;
            font-size: 0.875rem;
          }
          
          .nav-item:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
          }
          
          .nav-item.active {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border-left-color: white;
          }
          
          .nav-icon {
            width: 16px;
            text-align: center;
          }
          
          .main-content {
            flex: 1;
            margin-left: 280px;
            display: flex;
            flex-direction: column;
          }
          
          .header {
            background: white;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .breadcrumb {
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }
          
          .page-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
          }
          
          .content-area {
            flex: 1;
            padding: 2rem;
          }
          
          .content-wrapper {
            max-width: 1024px;
            margin: 0 auto;
          }
          
          .footer {
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
            padding: 1rem 2rem;
          }
          
          .footer-content {
            max-width: 1024px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .user-info {
            font-size: 0.875rem;
            color: #6b7280;
            line-height: 1.4;
          }
          
          .nav-buttons {
            display: flex;
            gap: 1rem;
          }
          
          .nav-btn {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            border: 1px solid;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            background: none;
          }
          
          .nav-btn-secondary {
            background: white;
            color: #374151;
            border-color: #d1d5db;
          }
          
          .nav-btn-primary {
            background: #4f46e5;
            color: white;
            border-color: #4f46e5;
          }
          
          @media (max-width: 768px) {
            .sidebar {
              transform: translateX(-100%);
            }
            .main-content {
              margin-left: 0;
            }
          }
        `}
      </style>

      <div className='layout-container'>
        {/* 侧边栏 */}

        <aside className='sidebar'>
          <div className='sidebar-content'>
            <div className='logo'>
              <div className='logo-icon'>🏥</div>
              <div className='logo-text'>
                <div>Virtual</div>
                <div>Hospitals</div>
                <div>Africa</div>
              </div>
            </div>

            <nav>
              <a href='#' className='nav-item'>
                <span className='nav-icon'>✓</span>
                <span>This Visit</span>
              </a>
              <a href='#' className='nav-item'>
                <span className='nav-icon'>🏥</span>
                <span>Primary Care</span>
              </a>
              <a href='#' className='nav-item active'>
                <span className='nav-icon'>👤</span>
                <span>Personal Information</span>
              </a>
              <a href='#' className='nav-item'>
                <span className='nav-icon'>📞</span>
                <span>Contacts</span>
              </a>
              <a href='#' className='nav-item'>
                <span className='nav-icon'>🔬</span>
                <span>Biometrics</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className='main-content'>
          <header className='header'>
            <div className='breadcrumb'>03_Intake / Personal Information</div>
            <h1 className='page-title'>Patient Intake</h1>
          </header>

          <div className='content-area'>
            <div className='content-wrapper'>
              {children}
            </div>
          </div>

          <footer className='footer'>
            <div className='footer-content'>
              <div className='user-info'>
                Ayanda<br />
                Nurse
              </div>
              <div className='nav-buttons'>
                <button className='nav-btn nav-btn-secondary'>← Back</button>
                <button className='nav-btn nav-btn-primary'>Next →</button>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  )
}
