import { ReactNode } from 'react';
import SupplierHeader from './SupplierHeader';

interface SupplierLayoutProps {
  children: ReactNode;
}

const SupplierLayout = ({ children }: SupplierLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierHeader />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SupplierLayout;