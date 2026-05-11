import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, Calendar, MessageSquare, Shield, ArrowRight, 
  Stethoscope, Users, Clock, Video, Lock, FileText, CheckCircle, 
  Mail, Phone, MapPin, Globe, Link as LinkIcon, Star
} from 'lucide-react';

const Landing = () => {
  const [reviews, setReviews] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axiosInstance.get('/reviews');
        setReviews(data);
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      }
    };
    fetchReviews();
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-primary/20 selection:text-primary">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary">
          <Activity size={32} />
          <span className="text-2xl font-heading font-bold tracking-tight">MediCare Connect</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
          <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
        </div>
        <div className="flex gap-4">
          {user ? (
            <Link to={user.role === 'doctor' ? '/doctor/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="px-6 py-2.5 bg-primary text-white font-medium rounded-full hover:bg-teal-700 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-full transition-colors">
                Log in
              </Link>
              <Link to="/register" className="px-6 py-2.5 bg-primary text-white font-medium rounded-full hover:bg-teal-700 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="flex-1 space-y-8 z-10"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              The Future of Telehealth is Here
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-heading font-bold text-gray-900 leading-[1.1]">
              Your Health, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Connected.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-xl leading-relaxed">
              Experience seamless healthcare. Book intelligent appointments, consult top doctors via video, get automated medicine reminders, and chat with our 24/7 AI health assistant.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/register" className="px-8 py-4 bg-primary text-white text-lg font-medium rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group">
                Find a Doctor <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register?role=doctor" className="px-8 py-4 bg-white text-gray-800 text-lg font-medium rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2">
                Join as Provider
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="pt-8 flex items-center gap-6 text-sm text-gray-500 font-medium">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
                ))}
              </div>
              <p>Trusted by <span className="text-gray-900 font-bold">10,000+</span> patients worldwide</p>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 relative w-full max-w-lg lg:max-w-none"
          >
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-[8px] border-white bg-white">
              <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Doctor consulting patient" className="w-full h-auto object-cover aspect-[4/3]" />
              
              {/* Floating UI Elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-8 left-8 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-lg flex items-center gap-3"
              >
                <div className="bg-green-100 text-green-600 p-2 rounded-full"><CheckCircle size={24} /></div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Appointment</p>
                  <p className="text-sm font-bold text-gray-900">Confirmed for 10:00 AM</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute bottom-8 right-8 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-lg flex items-center gap-3"
              >
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><MessageSquare size={24} /></div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">AI Assistant</p>
                  <p className="text-sm font-bold text-gray-900">"Your vitals look great!"</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
            <div className="text-center">
              <h3 className="text-4xl font-heading font-bold text-primary mb-1">500+</h3>
              <p className="text-gray-500 font-medium">Verified Specialists</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-heading font-bold text-primary mb-1">10k+</h3>
              <p className="text-gray-500 font-medium">Active Patients</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-heading font-bold text-primary mb-1">4.9/5</h3>
              <p className="text-gray-500 font-medium">Average Rating</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-heading font-bold text-primary mb-1">24/7</h3>
              <p className="text-gray-500 font-medium">Support & AI Chat</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Features Section */}
      <section id="features" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-4xl font-heading font-bold mb-4 text-gray-900">Comprehensive Care in One Platform</h2>
            <p className="text-lg text-gray-600">Everything you need to manage your health effectively, securely, and conveniently from the comfort of your home.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Video size={28} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-gray-900">Virtual Consultations</h3>
              <p className="text-gray-600">Connect with top doctors via high-quality, secure video calls without leaving your home.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
              <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-gray-900">Smart Reminders</h3>
              <p className="text-gray-600">Never miss a dose. Automated medicine reminders via email and push notifications.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-gray-900">AI Health Assistant</h3>
              <p className="text-gray-600">24/7 access to our context-aware AI chatbot that knows your history and provides instant answers.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock size={28} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-gray-900">Secure Messaging</h3>
              <p className="text-gray-600">End-to-end encrypted direct messaging between patients and doctors for quick follow-ups.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText size={28} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-gray-900">Digital Records</h3>
              <p className="text-gray-600">Access your prescriptions, medical history, and consultation notes securely in one place.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar size={28} />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-gray-900">Easy Scheduling</h3>
              <p className="text-gray-600">Seamlessly book, reschedule, or cancel appointments with real-time doctor availability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Based Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
            <div className="flex-1 space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 font-bold text-sm tracking-wide uppercase">For Patients</div>
              <h2 className="text-4xl font-heading font-bold text-gray-900">Take Control of Your Health Journey</h2>
              <p className="text-lg text-gray-600">Access world-class medical professionals, manage your records, and utilize AI-driven insights to live a healthier life.</p>
              <ul className="space-y-4 pt-4">
                {['Find specialized doctors near you', 'Book instant video consultations', 'Get automated pill reminders', 'Chat securely with providers'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle className="text-primary" size={20} /> {item}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Link to="/register" className="text-primary font-bold hover:text-teal-700 flex items-center gap-2 group">
                  Patient Registration <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
               <div className="absolute inset-0 bg-blue-100 rounded-3xl rotate-3 -z-10"></div>
               <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Patient using app" className="rounded-3xl shadow-xl object-cover h-[400px] w-full" />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-600 font-bold text-sm tracking-wide uppercase">For Doctors</div>
              <h2 className="text-4xl font-heading font-bold text-gray-900">Grow Your Practice Digitally</h2>
              <p className="text-lg text-gray-600">Streamline your workflow, manage appointments efficiently, and provide exceptional remote care to patients globally.</p>
              <ul className="space-y-4 pt-4">
                {['Set your own availability and pricing', 'Conduct seamless video sessions', 'Manage digital patient records', 'Reduce no-shows with smart alerts'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle className="text-primary" size={20} /> {item}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Link to="/register?role=doctor" className="text-primary font-bold hover:text-teal-700 flex items-center gap-2 group">
                  Provider Application <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
               <div className="absolute inset-0 bg-teal-100 rounded-3xl -rotate-3 -z-10"></div>
               <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Doctor checking records" className="rounded-3xl shadow-xl object-cover h-[400px] w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold mb-4 text-gray-900">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Your journey to better health is just three simple steps away.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 -z-10"></div>

            {[
              { step: 1, title: 'Create an Account', desc: 'Sign up securely in seconds. Tell us about your medical history and preferences.' },
              { step: 2, title: 'Find a Specialist', desc: 'Browse verified doctors, check their availability, and book an appointment instantly.' },
              { step: 3, title: 'Get Remote Care', desc: 'Join the video consultation, receive your digital prescription, and get better.' }
            ].map((item) => (
              <div key={item.step} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-lg shadow-primary/30 ring-8 ring-white">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold font-heading mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold mb-4 text-gray-900">What Our Patients Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Don't just take our word for it. Read the success stories from people who transformed their healthcare experience.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {(reviews.length > 0 ? reviews.map(r => ({
                name: r.user?.name || 'Anonymous',
                role: r.user?.role || 'User',
                image: r.user?.profilePic || 'https://i.pravatar.cc/150?img=12',
                quote: r.comment,
                rating: r.rating
              })) : [
              {
                name: 'Sarah Jenkins',
                role: 'Patient',
                image: 'https://i.pravatar.cc/150?img=47',
                quote: 'MediCare Connect changed my life. I can easily book appointments with specialists and the medicine reminders mean I never miss my daily doses. The video calls are crystal clear!',
                rating: 5
              },
              {
                name: 'Dr. Michael Chen',
                role: 'Doctor',
                image: 'https://i.pravatar.cc/150?img=11',
                quote: 'As a provider, the platform has streamlined my entire practice. Managing digital records and conducting remote follow-ups has never been easier. Highly recommended for any clinic.',
                rating: 5
              },
              {
                name: 'Emily Davis',
                role: 'Patient',
                image: 'https://i.pravatar.cc/150?img=9',
                quote: 'The AI Health Assistant is incredibly smart. It understands my medical history and gives me immediate peace of mind when I have minor health questions in the middle of the night.',
                rating: 5
              }
            ]).map((testimonial, idx) => (
              <div key={idx} className="bg-[#F8FAFC] p-8 rounded-3xl border border-gray-100 shadow-sm relative">
                <div className="flex gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} className={i < testimonial.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />)}
                </div>
                <p className="text-gray-700 italic mb-8 relative z-10">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary -z-20"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 -z-10"></div>
        <div className="max-w-4xl mx-auto px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">Ready to transform your healthcare experience?</h2>
          <p className="text-xl text-primary-50 mb-10 max-w-2xl mx-auto">Join thousands of patients and providers on MediCare Connect today. Free for patients to join.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to={user.role === 'doctor' ? '/doctor/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="px-8 py-4 bg-white text-primary text-lg font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="px-8 py-4 bg-white text-primary text-lg font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  Create Free Account
                </Link>
                <Link to="/login" className="px-8 py-4 bg-teal-800 text-white border border-teal-600 text-lg font-bold rounded-2xl hover:bg-teal-900 transition-all shadow-xl hover:-translate-y-1">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-gray-900 text-gray-300 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2 text-white">
                <Activity size={32} className="text-primary" />
                <span className="text-2xl font-heading font-bold tracking-tight">MediCare Connect</span>
              </div>
              <p className="text-gray-400 max-w-sm leading-relaxed">
                Bridging the gap between patients and healthcare providers through innovative technology, AI integration, and secure remote consultations.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="/" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors hover:text-white text-gray-400"><Globe size={18} /></a>
                <Link to="/register" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors hover:text-white text-gray-400"><LinkIcon size={18} /></Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link to="/login" className="hover:text-primary transition-colors">Find a Doctor</Link></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Our Services</a></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Pricing Plans</Link></li>
                <li><a href="#testimonials" className="hover:text-primary transition-colors">Patient Reviews</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Legal & Support</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><a href="mailto:support@medicareconnect.com" className="hover:text-primary transition-colors">Help Center & FAQ</a></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Accessibility</Link></li>
                <li><a href="mailto:support@medicareconnect.com" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact Info</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                  <span>123 Health Ave, Medical District<br/>Jhunjhunu, Rajasthan 333001</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-primary shrink-0" />
                  <span>9352165299</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-primary shrink-0" />
                  <span>rohito1938sb@gmail.com</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium">
            <p>&copy; {new Date().getFullYear()} MediCare Connect. All rights reserved.</p>
            
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
