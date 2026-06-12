import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Zap, ShieldCheck, Cpu, Users, Globe, MessageSquare, Mail, Phone, MapPin, ExternalLink, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutApp = () => {
  const navigate = useNavigate();

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-x-hidden selection:bg-primary-500/30">
      <nav className="fixed top-0 left-0 w-full p-4 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to App</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">PulseChat</span>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <motion.section 
          initial="hidden" animate="visible" variants={fadeIn}
          className="text-center py-20 relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary-600 to-blue-500 bg-clip-text text-transparent">
            Communication, Evolved.
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            PulseChat provides a seamless, lightning-fast, and deeply immersive messaging experience designed for the modern web.
          </p>
        </motion.section>

        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-20"
        >
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Zero-delay messaging and real-time typing indicators powered by WebSockets.", color: "text-amber-500", bg: "bg-amber-500/10" },
            { icon: ShieldCheck, title: "Secure Core", desc: "Robust JWT authentication protects your identity and keeps conversations private.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { icon: Globe, title: "Fluid Navigation", desc: "Cinematic animations and beautiful, responsive design adapt to every screen size.", color: "text-blue-500", bg: "bg-blue-500/10" }
          ].map((feature, idx) => (
            <motion.div key={idx} variants={fadeIn} className="p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-slate-800 hover:-translate-y-2 transition-transform duration-300">
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.section>

        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
          className="my-32 max-w-4xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Cpu className="w-8 h-8 text-primary-500" />
              How It Works
            </h2>
            <p className="text-lg text-slate-500">Navigate and use the core features with ease.</p>
          </div>

          <div className="space-y-12 relative before:absolute before:inset-0 before:left-8 md:before:left-1/2 md:before:-translate-x-px before:h-full before:w-1 before:bg-gradient-to-b before:from-primary-500/20 before:via-primary-500/50 before:to-primary-500/20">
            {[
              { title: "Profile Setup", desc: "Edit your bio, location, and phone number to let others know who you are.", icon: Info },
              { title: "Start a Conversation", desc: "Search for registered users and instantly create a secure communication channel.", icon: Users },
              { title: "Instant Messaging", desc: "Type your message and hit send! Experience real-time delivery with no delay.", icon: MessageSquare }
            ].map((step, idx) => (
              <motion.div key={idx} variants={fadeIn} className={`relative flex items-center gap-8 md:justify-between ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="hidden md:block w-5/12" />
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full border-4 border-slate-50 dark:border-slate-950 bg-primary-500 text-white z-10 shadow-xl shadow-primary-500/40">
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="ml-20 md:ml-0 w-full md:w-5/12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
                  <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
          className="my-32 text-center"
        >
          <h2 className="text-4xl font-bold mb-4">Meet the Team</h2>
          <p className="text-lg text-slate-500 mb-12">The passionate engineers and designers behind PulseChat.</p>
          
          <div className="flex flex-col items-center gap-8">
            <div className="p-8 rounded-3xl bg-gradient-to-b from-primary-50 to-white dark:from-slate-900 dark:to-slate-950 border border-primary-100 dark:border-slate-800 shadow-2xl max-w-sm w-full">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/40 mb-6">
                AM
              </div>
              <h3 className="text-2xl font-bold mb-1">MR. Ali Mehmood</h3>
              <span className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs uppercase font-bold tracking-wider mb-4">Creator & Lead</span>
              <p className="text-slate-600 dark:text-slate-400">Full Stack Engineering & Architecture</p>
            </div>
            
            
          </div>
        </motion.section>

        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="my-32 max-w-5xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-lg text-slate-500">Have questions or feedback? We'd love to hear from you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Mail, label: "Email Us", value: "support@pulsechat.app", href: "mailto:support@pulsechat.app", color: "text-blue-500" },
              { icon: Phone, label: "Call Us", value: "+1 (555) 123-4567", color: "text-emerald-500" },
              { icon: MapPin, label: "Visit Us", value: "123 Innovation Drive", color: "text-purple-500" }
            ].map((contact, idx) => (
              <motion.a 
                key={idx} variants={fadeIn}
                href={contact.href || "#"}
                className="flex flex-col items-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-center group"
              >
                <div className={`w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${contact.color}`}>
                  <contact.icon className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{contact.label}</p>
                <p className="font-bold text-lg">{contact.value}</p>
                {contact.href && <ExternalLink className="w-5 h-5 mt-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 transition-colors" />}
              </motion.a>
            ))}
          </div>
        </motion.section>

      </main>
    </div>
  );
};

export default AboutApp;
