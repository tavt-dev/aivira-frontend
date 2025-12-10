import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MockService } from '../services/mockService';
import { Product } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/ui/Motion';
import { motion, AnimatePresence } from 'framer-motion';

export const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>('Tất cả');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MockService.getProducts().then(data => {
      setProducts(data);
      setFiltered(data);
      setLoading(false);
    });
  }, []);

  const handleFilter = (cat: string) => {
    setCategory(cat);
    if (cat === 'Tất cả') {
      setFiltered(products);
    } else {
      setFiltered(products.filter((p: Product) => p.category === cat));
    }
  };

  const categories = ['Tất cả', ...Array.from(new Set(products.map((p: Product) => p.category)))] as string[];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold dark:text-white"
          >
            Bộ sưu tập
          </motion.h1>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
            {categories.map(cat => (
              <Button 
                key={cat} 
                variant={category === cat ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleFilter(cat)}
                className="whitespace-nowrap"
              >
                {cat}
                {category === cat && (
                  <motion.span layoutId="activeFilter" className="ml-2 w-1.5 h-1.5 bg-white rounded-full inline-block" />
                )}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <StaggerContainer 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode='popLayout' key={category}>
              {filtered.map((product: Product) => (
                <StaggerItem key={product.id}>
                  <Link to={`/products/${product.id}`} className="group h-full block">
                    <Card className="h-full overflow-hidden border-slate-200 dark:border-slate-800">
                      <div className="aspect-square relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                         <motion.img 
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            src={product.image} 
                            alt={product.name} 
                            className="object-cover w-full h-full" 
                         />
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{product.category}</p>
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{product.name}</h3>
                        <div className="flex justify-between items-center mt-3">
                          <span className="font-bold text-lg dark:text-primary-400">${product.price}</span>
                          <Button size="sm" variant="secondary" className="h-8 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            Xem
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </AnimatePresence>
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
};