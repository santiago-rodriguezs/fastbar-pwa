"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
import Link from 'next/link';
import { toast } from 'sonner';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

// Product interface
interface Product {
  id: string;
  name: string;
  priceCents: number;
  category: string;
  active: boolean;
}

// Event interface
interface Event {
  id: string;
  name: string;
  date: Date;
  location: string;
  active: boolean;
}

// Cart item interface
interface CartItem {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
}

export default function ProductsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Format price in local currency
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    });
  };

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => {
    return total + (item.priceCents * item.qty);
  }, 0);

  // Calculate total items in cart
  const cartItemCount = cart.reduce((count, item) => {
    return count + item.qty;
  }, 0);

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter(product => product.category === selectedCategory)
    : products;

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      // Check if product is already in cart
      const existingItem = prevCart.find(item => item.productId === product.id);
      
      if (existingItem) {
        // Update quantity if product is already in cart
        return prevCart.map(item =>
          item.productId === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevCart, {
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          qty: 1,
        }];
      }
    });
    
    toast.success(`${product.name} agregado al carrito`);
  };

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      // Find the item
      const existingItem = prevCart.find(item => item.productId === productId);
      
      if (existingItem && existingItem.qty > 1) {
        // Decrease quantity if more than 1
        return prevCart.map(item =>
          item.productId === productId
            ? { ...item, qty: item.qty - 1 }
            : item
        );
      } else {
        // Remove item from cart if quantity is 1
        return prevCart.filter(item => item.productId !== productId);
      }
    });
  };

  // Get quantity of product in cart
  const getCartQuantity = (productId: string) => {
    const item = cart.find(item => item.productId === productId);
    return item ? item.qty : 0;
  };

  // Go to checkout
  const goToCheckout = () => {
    // Save cart to localStorage for persistence
    localStorage.setItem('fastbar_cart', JSON.stringify({
      eventId,
      items: cart,
    }));
    
    router.push('/cart');
  };

  // Fetch event and products
  useEffect(() => {
    const fetchEventAndProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch event data
        const eventRef = doc(db, 'events', eventId as string);
        const eventDoc = await getDoc(eventRef);
        
        if (!eventDoc.exists()) {
          throw new Error('Event not found');
        }
        
        const eventData = eventDoc.data();
        setEvent({
          id: eventDoc.id,
          name: eventData.name,
          date: eventData.date.toDate(),
          location: eventData.location,
          active: eventData.active,
        });
        
        // Fetch products for the event
        const productsQuery = query(
          collection(db, 'events', eventId as string, 'products'),
          where('active', '==', true)
        );
        
        const productsSnapshot = await getDocs(productsQuery);
        
        if (productsSnapshot.empty) {
          // No products found, use mock data
          const mockProducts: Product[] = [
            {
              id: 'product-1',
              name: 'Cerveza Rubia',
              priceCents: 800,
              category: 'bebidas',
              active: true,
            },
            {
              id: 'product-2',
              name: 'Cerveza IPA',
              priceCents: 900,
              category: 'bebidas',
              active: true,
            },
            {
              id: 'product-3',
              name: 'Gin Tonic',
              priceCents: 1200,
              category: 'bebidas',
              active: true,
            },
            {
              id: 'product-4',
              name: 'Fernet con Cola',
              priceCents: 1000,
              category: 'bebidas',
              active: true,
            },
            {
              id: 'product-5',
              name: 'Agua Mineral',
              priceCents: 500,
              category: 'sin-alcohol',
              active: true,
            },
            {
              id: 'product-6',
              name: 'Gaseosa',
              priceCents: 600,
              category: 'sin-alcohol',
              active: true,
            },
          ];
          
          setProducts(mockProducts);
          
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(mockProducts.map(product => product.category))
          );
          setCategories(uniqueCategories);
        } else {
          // Map Firestore documents to Product objects
          const fetchedProducts = productsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              priceCents: data.priceCents,
              category: data.category,
              active: data.active,
            };
          });
          
          setProducts(fetchedProducts);
          
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(fetchedProducts.map(product => product.category))
          );
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching event and products:', error);
        
        // #TODO: Use mock data for demo purposes
        const mockEvent: Event = {
          id: eventId as string,
          name: 'Demo Festival',
          date: new Date('2025-10-31T20:00:00'),
          location: 'Demo Club',
          active: true,
        };
        setEvent(mockEvent);
        
        const mockProducts: Product[] = [
          {
            id: 'product-1',
            name: 'Cerveza Rubia',
            priceCents: 800,
            category: 'bebidas',
            active: true,
          },
          {
            id: 'product-2',
            name: 'Cerveza IPA',
            priceCents: 900,
            category: 'bebidas',
            active: true,
          },
          {
            id: 'product-3',
            name: 'Gin Tonic',
            priceCents: 1200,
            category: 'bebidas',
            active: true,
          },
          {
            id: 'product-4',
            name: 'Fernet con Cola',
            priceCents: 1000,
            category: 'bebidas',
            active: true,
          },
          {
            id: 'product-5',
            name: 'Agua Mineral',
            priceCents: 500,
            category: 'sin-alcohol',
            active: true,
          },
          {
            id: 'product-6',
            name: 'Gaseosa',
            priceCents: 600,
            category: 'sin-alcohol',
            active: true,
          },
        ];
        
        setProducts(mockProducts);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(mockProducts.map(product => product.category))
        );
        setCategories(uniqueCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndProducts();
    
    // Load cart from localStorage if exists
    const savedCart = localStorage.getItem('fastbar_cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.eventId === eventId) {
        setCart(parsedCart.items);
      }
    }
  }, [eventId]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg">Cargando productos...</p>
      </div>
    );
  }

  // Show error state if event not found
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-lg text-destructive">Evento no encontrado</p>
        <Button asChild className="mt-4">
          <Link href="/events">Volver a eventos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild className="h-10 w-10">
          <Link href="/events">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">{event.name}</h1>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          Todos
        </Button>
        
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Products */}
      <div className="space-y-4 mb-20">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => {
            const quantity = getCartQuantity(product.id);
            
            return (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-lg font-semibold mt-1">
                        {formatPrice(product.priceCents)}
                      </p>
                    </div>
                    
                    {quantity > 0 ? (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => removeFromCart(product.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-6 text-center">{quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => addToCart(product)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addToCart(product)}
                      >
                        Agregar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            No hay productos disponibles en esta categoría
          </p>
        )}
      </div>

      {/* Cart Button (Fixed at bottom) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button 
            className="w-full flex items-center justify-between"
            onClick={goToCheckout}
          >
            <div className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              <span>{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}</span>
            </div>
            <span>{formatPrice(cartTotal)}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
