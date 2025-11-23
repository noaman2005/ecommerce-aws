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
            color: '#b7472f',
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
    <div className="min-h-screen bg-gradient-to-b from-[#fffdf8] via-[#fef3eb] to-[#f7ebe0] text-[#1c1a17] py-10 sm:py-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-0">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/cart')}
          className="mb-4 sm:mb-6 text-[#5f4b3f] hover:text-[#b7472f] hover:bg-[#f4ebe3]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-xs sm:text-sm ${
                    currentStep >= step.id
                      ? 'bg-[#b7472f] text-white shadow-[0_8px_18px_rgba(183,71,47,0.4)]'
                      : 'bg-[#f4ebe3] text-[#5f4b3f]'
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                </div>
                <span
                  className={`ml-2 text-xs sm:text-sm font-medium ${
                    currentStep >= step.id ? 'text-[#b7472f]' : 'text-[#5f4b3f]'
                  }`}
                >
                  {step.name}
                </span>
                {step.id < steps.length && (
                  <div
                    className={`w-10 sm:w-14 h-0.5 ml-3 sm:ml-4 rounded-full ${
                      currentStep > step.id ? 'bg-[#b7472f]' : 'bg-[#e3d5c6]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-5 sm:p-6 bg-white/85 border border-[#d9cfc2] shadow-[0_14px_36px_rgba(28,26,23,0.08)]">
                  <h2 className="text-lg sm:text-xl font-semibold text-[#1c1a17] mb-2 sm:mb-4">
                    Shipping Address
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5f4b3f] mb-4 sm:mb-6">
                    We currently ship within India. Please enter the address where you&apos;d like your Nisha Stationery parcel delivered.
                  </p>
                  
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

                    <Button type="submit" className="w-full bg-[#b7472f] hover:bg-[#c3743a] text-white border-0">
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
                <Card className="p-5 sm:p-6 bg-white/85 border border-[#d9cfc2] shadow-[0_14px_36px_rgba(28,26,23,0.08)]">
                  <h2 className="text-lg sm:text-xl font-semibold text-[#1c1a17] mb-2 sm:mb-4">
                    Payment Information
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5f4b3f] mb-4 sm:mb-6">
                    We use Razorpay for secure payments. You can pay using UPI, cards, netbanking or popular wallets.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-[#d9cfc2] rounded-2xl bg-[#fff8f1]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="w-5 h-5 text-[#b7472f] mr-3" />
                          <div>
                            <span className="font-medium text-sm sm:text-base block text-[#1c1a17]">Razorpay secure checkout</span>
                            <span className="text-xs sm:text-sm text-[#5f4b3f]">Credit/Debit cards, UPI, netbanking & wallets</span>
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

                    <div className="bg-[#fff2e6] border border-[#f1c9a3] rounded-2xl p-4">
                      <p className="text-xs sm:text-sm text-[#8a4c27]">
                        <strong>Secure payment:</strong> Your payment is handled directly by Razorpay in an encrypted checkout. Nisha Stationery never stores your card details.
                      </p>
                    </div>

                    <div className="bg-[#fffaf6] border border-[#e7d5c3] rounded-2xl p-4">
                      <p className="text-xs sm:text-sm text-[#5f4b3f]">
                        When you click <strong>Pay now</strong>, a secure Razorpay window will open so you can complete your payment.
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 border-[#d9cfc2] text-[#5f4b3f] hover:bg-[#f4ebe3]"
                      >
                        Back to Shipping
                      </Button>
                      <Button
                        onClick={handlePayment}
                        isLoading={isProcessing}
                        className="flex-1 bg-[#b7472f] hover:bg-[#c3743a] text-white border-0"
                      >
                        {isProcessing ? 'Processing...' : 'Pay now'}
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
              <Card className="p-5 sm:p-6 sticky top-24 bg-white/85 border border-[#d9cfc2] shadow-[0_16px_40px_rgba(28,26,23,0.08)]">
                <h3 className="text-base sm:text-lg font-semibold text-[#1c1a17] mb-3 sm:mb-4 flex items-center justify-between">
                  Order Summary
                  <span className="text-xs font-medium text-[#5f4b3f]">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                </h3>
                
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#fff4ea] border border-[#f1d3b5] flex items-center justify-center">
                        <Package className="w-5 h-5 text-[#b7472f]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-[#1c1a17] line-clamp-1">{item.product.name}</p>
                        <p className="text-xs sm:text-sm text-[#5f4b3f]">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm sm:text-base text-[#1c1a17]">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#f1e3d5] mt-5 pt-5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#5f4b3f]">Subtotal</span>
                    <span className="text-[#1c1a17]">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5f4b3f]">Shipping</span>
                    <span className="text-[#1c1a17]">${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5f4b3f]">Tax</span>
                    <span className="text-[#1c1a17]">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#f1e3d5] pt-3 mt-2">
                    <div className="flex justify-between font-semibold text-sm sm:text-base">
                      <span className="text-[#1c1a17]">Total</span>
                      <span className="text-[#b7472f]">${finalTotal.toFixed(2)}</span>
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
