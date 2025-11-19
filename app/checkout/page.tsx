'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, Package, ArrowLeft, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useCartStore } from '@/lib/store/cart-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { Address } from '@/types';
import { toast } from 'sonner';

const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'United States',
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      router.push('/auth/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      router.push('/cart');
      return;
    }
  }, [isAuthenticated, items.length, router]);

  const handleAddressSubmit = (data: AddressFormData) => {
    // In real app, save address and move to payment
    setCurrentStep(2);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const shippingCost = 9.99;
      const tax = total * 0.08;
      const finalTotal = total + shippingCost + tax;
      const amountInPaise = Math.round(finalTotal * 100); // Razorpay expects amount in paise

      // Create order in DynamoDB first
      const orderId = `ORDER-${Date.now()}`;
      const orderData = {
        id: orderId,
        userId: user?.id || 'unknown',
        items: items.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total: finalTotal,
        subtotal: total,
        shipping: shippingCost,
        tax: tax,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save order to DynamoDB
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      // Create Razorpay order first
      const razorpayRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          orderId,
        }),
      });

      if (!razorpayRes.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const razorpayData = await razorpayRes.json();

      // Initialize Razorpay
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          amount: amountInPaise,
          currency: 'INR',
          name: 'Paper & Ink',
          description: `Order ${orderId}`,
          order_id: razorpayData.data.razorpayOrderId,
          handler: async (response: any) => {
            try {
              const userId = user?.id || 'unknown';
              console.log('Payment handler - userId:', userId, 'user:', user);
              
              // Verify payment and update order status
              const verifyRes = await fetch('/api/orders/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId,
                  userId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              if (verifyRes.ok) {
                clearCart();
                toast.success('Payment successful! Order placed.');
                router.push(`/orders/${orderId}`);
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (error) {
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#2563eb',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 1, name: 'Shipping', icon: MapPin },
    { id: 2, name: 'Payment', icon: CreditCard },
    { id: 3, name: 'Confirmation', icon: Check },
  ];

  const shippingCost = 9.99;
  const tax = total * 0.08; // 8% tax
  const finalTotal = total + shippingCost + tax;

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/cart')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
                {step.id < steps.length && (
                  <div
                    className={`w-16 h-0.5 ml-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Shipping Address
                  </h2>
                  
                  <form onSubmit={handleSubmit(handleAddressSubmit)} className="space-y-4">
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      error={errors.fullName?.message}
                      {...register('fullName')}
                    />

                    <Input
                      label="Address Line 1"
                      placeholder="123 Main Street"
                      error={errors.addressLine1?.message}
                      {...register('addressLine1')}
                    />

                    <Input
                      label="Address Line 2 (Optional)"
                      placeholder="Apartment, suite, etc."
                      error={errors.addressLine2?.message}
                      {...register('addressLine2')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        placeholder="New York"
                        error={errors.city?.message}
                        {...register('city')}
                      />
                      <Input
                        label="State"
                        placeholder="NY"
                        error={errors.state?.message}
                        {...register('state')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Postal Code"
                        placeholder="10001"
                        error={errors.postalCode?.message}
                        {...register('postalCode')}
                      />
                      <Input
                        label="Country"
                        placeholder="United States"
                        error={errors.country?.message}
                        {...register('country')}
                      />
                    </div>

                    <Input
                      label="Phone Number"
                      placeholder="+1 (555) 123-4567"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />

                    <Button type="submit" className="w-full">
                      Continue to Payment
                    </Button>
                  </form>
                </Card>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Payment Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
                          <div>
                            <span className="font-medium block">Razorpay Secure Payment</span>
                            <span className="text-sm text-gray-600">Credit/Debit Card, UPI, Wallets</span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="payment"
                          defaultChecked
                          className="h-4 w-4 text-blue-600"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Secure Payment:</strong> Your payment will be processed securely through Razorpay. We accept all major credit/debit cards, UPI, and digital wallets.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        Click "Pay Now" to proceed to the secure Razorpay payment gateway.
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1"
                      >
                        Back to Shipping
                      </Button>
                      <Button
                        onClick={handlePayment}
                        isLoading={isProcessing}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {isProcessing ? 'Processing...' : 'Pay Now'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-6 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Order Summary
                </h3>
                
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
