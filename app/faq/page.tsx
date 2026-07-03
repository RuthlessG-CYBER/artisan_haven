"use client";

import { motion } from 'framer-motion';
import { Search, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

const FAQ_CATEGORIES = [
  { value: 'all', label: 'All Topics' },
  { value: 'orders', label: 'Orders & Shipping' },
  { value: 'products', label: 'Products' },
  { value: 'cakes', label: 'Custom Cakes' },
  { value: 'returns', label: 'Returns & Refunds' },
  { value: 'account', label: 'Account & Payments' },
];

const FAQ_ITEMS = [
  {
    category: 'orders',
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 3-5 business days. Express shipping (1-2 business days) is available for an additional fee. Custom cake orders require 48 hours notice and are delivered within our local delivery area.',
  },
  {
    category: 'orders',
    question: 'Do you offer international shipping?',
    answer: 'Currently, we ship within the United States only. For artisan goods, we use eco-friendly packaging and carbon-offset shipping. Healthy food products have a shorter shipping window to ensure freshness.',
  },
  {
    category: 'products',
    question: 'What materials are used in your art & crafts?',
    answer: 'We use 100% recycled or sustainably sourced materials. This includes recycled glass, reclaimed wood, upcycled textiles, and eco-friendly finishes. Each product page details the specific materials used.',
  },
  {
    category: 'products',
    question: 'Are your healthy food products organic?',
    answer: 'Yes! All our healthy food products are made with certified organic ingredients whenever possible. We never use artificial preservatives, colors, or flavors. Each product lists all ingredients clearly.',
  },
  {
    category: 'cakes',
    question: 'How far in advance should I order a custom cake?',
    answer: 'We recommend placing custom cake orders at least 1 week in advance. For wedding cakes or large events, please contact us at least 4-6 weeks ahead. Rush orders may be available for an additional fee.',
  },
  {
    category: 'cakes',
    question: 'Can I request specific dietary accommodations for cakes?',
    answer: 'Absolutely! We offer gluten-free, vegan, and nut-free options. Please mention any allergies or dietary requirements in the special instructions when placing your order.',
  },
  {
    category: 'returns',
    question: 'What is your return policy?',
    answer: 'For art & crafts: Unused items can be returned within 30 days for a full refund. For healthy foods: Unopened items can be returned within 14 days. Due to the custom nature of cakes, custom cake orders cannot be returned, but we guarantee satisfaction.',
  },
  {
    category: 'returns',
    question: 'What if my order arrives damaged?',
    answer: 'Please contact us immediately with photos of the damage. We offer free replacements or full refunds for damaged items. Custom cakes damaged during delivery will be replaced at no additional cost.',
  },
  {
    category: 'account',
    question: 'How do I track my order?',
    answer: 'Once your order ships, you will receive a tracking number via email. You can also track your order through our website under Orders > Track Order. For custom cake deliveries, our team will contact you directly.',
  },
  {
    category: 'account',
    question: 'Do you offer gift wrapping?',
    answer: 'Yes! All our products come in eco-friendly packaging suitable for gifting. Premium gift wrapping with sustainable materials is available for an additional $5. You can add a personalized gift message at checkout.',
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filteredFAQs = FAQ_ITEMS.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find quick answers to common questions about our products, orders, and services.
          </p>
        </motion.div>

        {/* Search & Filter */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                {FAQ_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          {filteredFAQs.length > 0 ? (
            <Accordion type="multiple" className="space-y-4">
              {filteredFAQs.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No questions found matching your search.</p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setCategory('all'); }}>
                Clear filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Our team is here to help you with any questions or concerns.
          </p>
          <Button asChild>
            <a href="/contact">Contact Us</a>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
