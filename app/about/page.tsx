"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Leaf, Heart, Award, Users, Target, Recycle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BUSINESS_NAME } from "@/lib/constants";

const TEAM = [
  {
    name: "Sarah Mitchell",
    role: "Founder & Artisan Director",
    image:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=400",
    bio: "A passionate artisan with 15 years of experience in sustainable crafts.",
  },
  {
    name: "James Chen",
    role: "Head Baker",
    image:
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=400",
    bio: "Our cake master with a passion for bringing joy through custom creations.",
  },
  {
    name: "Maria Garcia",
    role: "Nutrition Specialist",
    image:
      "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?w=400",
    bio: "Ensuring every healthy food product meets the highest nutritional standards.",
  },
];

const VALUES = [
  {
    icon: Leaf,
    title: "Sustainability First",
    description: "Every product is designed with environmental impact in mind.",
  },
  {
    icon: Heart,
    title: "Crafted with Love",
    description: "Passion and care go into every handmade creation.",
  },
  {
    icon: Award,
    title: "Quality Excellence",
    description: "We never compromise on quality or materials.",
  },
  {
    icon: Users,
    title: "Community Focus",
    description: "Supporting local artisans and fair trade practices.",
  },
];

const TIMELINE = [
  {
    year: "2015",
    title: "The Beginning",
    description: "Started as a small home-based craft studio",
  },
  {
    year: "2017",
    title: "First Workshop",
    description: "Opened our first physical location",
  },
  {
    year: "2019",
    title: "Healthy Foods Line",
    description: "Expanded into organic foods and snacks",
  },
  {
    year: "2020",
    title: "Custom Cakes",
    description: "Launched our custom cake customization service",
  },
  {
    year: "2022",
    title: "Online Store",
    description: "Expanded to serve customers nationwide",
  },
  {
    year: "2024",
    title: "Award Winning",
    description: "Recognized for sustainability excellence",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-background to-primary/5">
          <div className="flex h-full w-full items-center justify-center">
            <h1 className="text-8xl md:text-9xl font-black tracking-widest text-primary/10 select-none">
              ARTISAN
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge className="mb-6" variant="secondary">
              Our Story
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Crafting Beauty, Sustaining Nature
            </h1>
            <p className="text-xl text-muted-foreground">
              Since 2015, we've been creating handmade products that celebrate
              artistry while respecting our planet. Every piece tells a story of
              sustainable craftsmanship.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      {/* Our Story - Premium Version */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="grid grid-cols-2 gap-5">
                <div className="group relative aspect-square rounded-3xl overflow-hidden shadow-xl">
                  <Image
                    src="https://images.pexels.com/photos/1125135/pexels-photo-1125135.jpeg?w=600"
                    alt="Handmade process"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
                </div>

                <div className="group relative aspect-square rounded-3xl overflow-hidden mt-10 shadow-xl">
                  <Image
                    src="https://images.pexels.com/photos/5217777/pexels-photo-5217777.jpeg?w=600"
                    alt="Recycled materials"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
                </div>

                <div className="group relative aspect-square rounded-3xl overflow-hidden shadow-xl">
                  <Image
                    src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=600"
                    alt="Healthy foods"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
                </div>

                <div className="group relative aspect-square rounded-3xl overflow-hidden mt-10 shadow-xl">
                  <Image
                    src="https://images.pexels.com/photos/28983225/pexels-photo-28983225.jpeg?w=600"
                    alt="Custom cakes"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <Badge className="mb-5 rounded-full px-4 py-1">Our Story</Badge>

              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                From Passion
                <span className="block text-primary">To Purpose</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-5 leading-relaxed">
                <strong>{BUSINESS_NAME}</strong> began in a small home studio
                with a simple vision — creating beautiful handcrafted products
                while protecting the environment.
              </p>

              <p className="text-muted-foreground mb-5 leading-relaxed">
                What started as one artisan's dream has evolved into a community
                of creators, bakers, and sustainability enthusiasts committed to
                quality, creativity, and responsible craftsmanship.
              </p>

              <p className="text-muted-foreground mb-8 leading-relaxed">
                Today, we proudly offer recycled art & crafts, handmade healthy
                foods, and custom celebration cakes that bring joy while making
                a positive impact on the planet.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border bg-background/70 backdrop-blur-xl p-5 text-center shadow-lg hover:shadow-2xl transition">
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                    500+
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">Products</p>
                </div>

                <div className="rounded-2xl border bg-background/70 backdrop-blur-xl p-5 text-center shadow-lg hover:shadow-2xl transition">
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    10K+
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Customers
                  </p>
                </div>

                <div className="rounded-2xl border bg-background/70 backdrop-blur-xl p-5 text-center shadow-lg hover:shadow-2xl transition">
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
                    25+
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">Artisans</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything we do is guided by these core principles
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center">
                  <CardContent className="pt-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-muted-foreground">
              The milestones that shaped who we are
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {TIMELINE.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex gap-6 mb-8 last:mb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {item.year}
                  </div>
                  {index < TIMELINE.length - 1 && (
                    <div className="w-0.5 h-full bg-border flex-1" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground">
              The passionate people behind the products
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {TEAM.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="pt-6 text-center">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-primary text-sm mb-2">{member.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Recycle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Our Sustainability Pledge
              </h2>
            </motion.div>

            <div className="space-y-6 text-muted-foreground">
              <p>
                We believe that beautiful products shouldn't come at the expense
                of our planet. That's why every {BUSINESS_NAME} product is
                created with sustainability at its core.
              </p>
              <p>
                From sourcing recycled materials for our art and crafts, to
                using organic ingredients in our foods, to eco-friendly
                packaging - we make conscious choices at every step.
              </p>
              <p>
                Our goal is simple: create products you love while protecting
                the environment for future generations. When you purchase from
                us, you're not just buying a product - you're supporting a more
                sustainable future.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">90%</div>
                <div className="text-sm text-muted-foreground">
                  Recycled Materials
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">Zero</div>
                <div className="text-sm text-muted-foreground">
                  Plastic Packaging
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">100%</div>
                <div className="text-sm text-muted-foreground">
                  Carbon Offset
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
